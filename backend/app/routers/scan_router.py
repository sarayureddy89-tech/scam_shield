import json
import datetime as dt

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db, ScanRecord, gen_id
from ..auth import get_current_user_optional
from ..schemas import (
    MessageScanRequest, UrlScanRequest, QrScanRequest, PaymentScanRequest, ScanResult,
)
from ..analyzers.url_analyzer import analyze_url
from ..analyzers.nlp_analyzer import analyze_text
from ..analyzers.qr_analyzer import analyze_qr_payload, decode_qr_image
from ..analyzers.payment_analyzer import analyze_payment
from ..analyzers.risk_fusion_engine import fuse_signals

router = APIRouter(prefix="/api/scan", tags=["scan"])


def _persist_and_format(db: Session, user, scan_type: str, input_summary: str, fused: dict) -> ScanResult:
    record = ScanRecord(
        id=gen_id(),
        user_id=user.id if user else None,
        scan_type=scan_type,
        input_summary=input_summary[:500],
        score=fused["score"],
        level=fused["level"],
        why_json=json.dumps(fused["why"]),
        actions_json=json.dumps(fused["what_to_do"]),
        evidence_json=json.dumps(fused["technical_evidence"]),
        is_seed=False,
        created_at=dt.datetime.utcnow(),
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return _record_to_result(record)


def _record_to_result(record: ScanRecord) -> ScanResult:
    return ScanResult(
        id=record.id,
        scan_type=record.scan_type,
        score=record.score,
        level=record.level,
        why=json.loads(record.why_json),
        what_to_do=json.loads(record.actions_json),
        technical_evidence=json.loads(record.evidence_json),
        created_at=record.created_at.isoformat(),
    )


@router.post("/message", response_model=ScanResult)
def scan_message(payload: MessageScanRequest, db: Session = Depends(get_db), user=Depends(get_current_user_optional)):
    text_result = analyze_text(payload.text)
    url_result = None
    # If the message contains a URL, extract & fold it into the fusion too.
    import re
    found = re.search(r"https?://[^\s]+|www\.[^\s]+", payload.text)
    if found:
        url_result = analyze_url(found.group(0))
    fused = fuse_signals(text_result, url_result)
    summary = f"Message: {payload.text[:120]}"
    return _persist_and_format(db, user, "message", summary, fused)


@router.post("/url", response_model=ScanResult)
def scan_url(payload: UrlScanRequest, db: Session = Depends(get_db), user=Depends(get_current_user_optional)):
    url_result = analyze_url(payload.url)
    fused = fuse_signals(url_result)
    summary = f"URL: {payload.url[:120]}"
    return _persist_and_format(db, user, "url", summary, fused)


@router.post("/qr", response_model=ScanResult)
def scan_qr(payload: QrScanRequest, db: Session = Depends(get_db), user=Depends(get_current_user_optional)):
    raw_payload = payload.payload
    if not raw_payload and payload.image_base64:
        # Server-side decode path (best-effort; requires pyzbar+Pillow installed)
        import base64, tempfile, os
        with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as f:
            f.write(base64.b64decode(payload.image_base64))
            tmp_path = f.name
        raw_payload = decode_qr_image(tmp_path)
        os.unlink(tmp_path)
    if not raw_payload:
        raise HTTPException(status_code=400, detail="Could not decode QR payload. Provide 'payload' directly or a readable image.")
    qr_result = analyze_qr_payload(raw_payload)
    fused = fuse_signals(qr_result)
    summary = f"QR ({qr_result['payload_type']}): {raw_payload[:100]}"
    return _persist_and_format(db, user, "qr", summary, fused)


@router.post("/payment", response_model=ScanResult)
def scan_payment(payload: PaymentScanRequest, db: Session = Depends(get_db), user=Depends(get_current_user_optional)):
    pay_result = analyze_payment(upi_id=payload.upi_id, amount=payload.amount, note=payload.note)
    fused = fuse_signals(pay_result)
    summary = f"Payment: {payload.upi_id or ''} ₹{payload.amount or 0}"
    return _persist_and_format(db, user, "payment", summary, fused)


@router.get("/history")
def get_history(db: Session = Depends(get_db), user=Depends(get_current_user_optional), limit: int = 50):
    q = db.query(ScanRecord)
    if user:
        q = q.filter(ScanRecord.user_id == user.id)
    else:
        q = q.filter(ScanRecord.is_seed == True)  # anonymous visitors browse demo/seed history
    records = q.order_by(ScanRecord.created_at.desc()).limit(limit).all()
    return {
        "total": len(records),
        "scams_avoided": sum(1 for r in records if r.level in ("HIGH", "CRITICAL")),
        "results": [
            {
                "id": r.id, "scan_type": r.scan_type, "input_summary": r.input_summary,
                "score": r.score, "level": r.level, "created_at": r.created_at.isoformat(),
            }
            for r in records
        ],
    }


@router.get("/{scan_id}", response_model=ScanResult)
def get_scan(scan_id: str, db: Session = Depends(get_db)):
    record = db.query(ScanRecord).filter(ScanRecord.id == scan_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Scan not found")
    return _record_to_result(record)
