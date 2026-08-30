from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db, CommunityReport, gen_id
from ..schemas import ReportRequest

router = APIRouter(prefix="/api/community", tags=["community"])


@router.post("/report")
def report_scam(payload: ReportRequest, db: Session = Depends(get_db)):
    report = CommunityReport(
        id=gen_id(),
        scan_id=payload.scan_id,
        pattern_summary=payload.pattern_summary[:300],
        scan_type=payload.scan_type,
        score=payload.score,
        reporter_note=payload.reporter_note or "",
    )
    db.add(report)
    db.commit()
    return {"status": "reported", "id": report.id}


@router.get("/reports")
def list_reports(db: Session = Depends(get_db), limit: int = 10):
    reports = db.query(CommunityReport).order_by(CommunityReport.created_at.desc()).limit(limit).all()
    return {
        "total_reports": db.query(CommunityReport).count(),
        "recent": [
            {
                "id": r.id, "pattern_summary": r.pattern_summary, "scan_type": r.scan_type,
                "score": r.score, "created_at": r.created_at.isoformat(),
            }
            for r in reports
        ],
    }
