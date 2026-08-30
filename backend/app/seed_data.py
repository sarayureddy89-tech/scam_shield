"""
Seed script — populates the DB with realistic, offline-safe demo scenarios
so judges can explore results instantly without typing anything in.

Run with:  python -m app.seed_data
"""
import json
import datetime as dt

from .database import init_db, SessionLocal, ScanRecord, CommunityReport, gen_id
from .analyzers.url_analyzer import analyze_url
from .analyzers.nlp_analyzer import analyze_text
from .analyzers.qr_analyzer import analyze_qr_payload
from .analyzers.payment_analyzer import analyze_payment
from .analyzers.risk_fusion_engine import fuse_signals

SCENARIOS = [
    {
        "scan_type": "message",
        "label": "Lottery / prize-claim SMS",
        "build": lambda: fuse_signals(
            analyze_text("Congratulations! You won ₹25,000. Click this link to claim now! http://sbi-verify-kyc.xyz/claim"),
            analyze_url("http://sbi-verify-kyc.xyz/claim"),
        ),
        "summary": "Message: Congratulations! You won ₹25,000. Click this link to claim now!",
    },
    {
        "scan_type": "message",
        "label": "Fake bank KYC-suspension email",
        "build": lambda: fuse_signals(
            analyze_text("Dear Customer, your SBI account will be blocked within 24 hours. Update your KYC and share your OTP immediately to avoid suspension."),
        ),
        "summary": "Email: Dear Customer, your SBI account will be blocked within 24 hours...",
    },
    {
        "scan_type": "url",
        "label": "Fake HDFC login page (typosquat)",
        "build": lambda: fuse_signals(analyze_url("https://hdfcbank-secure-login.top/auth")),
        "summary": "URL: https://hdfcbank-secure-login.top/auth",
    },
    {
        "scan_type": "qr",
        "label": "Quishing QR — fake refund payment request",
        "build": lambda: fuse_signals(analyze_qr_payload("upi://pay?pa=kyc-update@ybl&pn=IndiaPost&am=1&tn=Pay Rs 1 to verify and claim your parcel redelivery refund")),
        "summary": "QR (upi_payment): upi://pay?pa=kyc-update@ybl&am=1...",
    },
    {
        "scan_type": "payment",
        "label": "Suspicious high-value UPI request",
        "build": lambda: fuse_signals(analyze_payment(upi_id="support-refund@okaxis", amount=48000, note="Immediate refund release pending, act now or ticket will be closed")),
        "summary": "Payment: support-refund@okaxis ₹48000",
    },
    {
        "scan_type": "message",
        "label": "Courier / delivery-agent scam",
        "build": lambda: fuse_signals(
            analyze_text("Your FedEx parcel is on hold due to unpaid customs duty. Pay now to avoid return: bit.ly/fedex-duty-pay"),
            analyze_url("bit.ly/fedex-duty-pay"),
        ),
        "summary": "Message: Your FedEx parcel is on hold due to unpaid customs duty...",
    },
    {
        "scan_type": "message",
        "label": "Fake IRCTC refund SMS",
        "build": lambda: fuse_signals(
            analyze_text("IRCTC: Your train ticket refund of Rs 1450 is pending. Verify your bank account now: irctc-refund.click"),
            analyze_url("irctc-refund.click"),
        ),
        "summary": "Message: IRCTC: Your train ticket refund of Rs 1450 is pending...",
    },
    {
        "scan_type": "url",
        "label": "SAFE — official SBI net-banking URL",
        "build": lambda: fuse_signals(analyze_url("https://www.sbi.co.in/web/personal-banking")),
        "summary": "URL: https://www.sbi.co.in/web/personal-banking",
    },
    {
        "scan_type": "message",
        "label": "SAFE — genuine OTP-less delivery update",
        "build": lambda: fuse_signals(analyze_text("Your Amazon order #402-1123456 has been shipped and will arrive by Thursday. Track it in the Amazon app.")),
        "summary": "Message: Your Amazon order #402-1123456 has been shipped and will arrive by Thursday.",
    },
    {
        "scan_type": "payment",
        "label": "SAFE — known low-value peer UPI request",
        "build": lambda: fuse_signals(analyze_payment(upi_id="rahul.mehta@okhdfcbank", amount=500, note="Splitting dinner bill from yesterday")),
        "summary": "Payment: rahul.mehta@okhdfcbank ₹500",
    },
]

COMMUNITY_REPORTS = [
    {"pattern_summary": "‘IndiaPost redelivery fee’ QR codes charging ₹1 verification then draining linked accounts.", "scan_type": "qr", "score": 91},
    {"pattern_summary": "SMS impersonating SBI asking to ‘update KYC’ via shortened bit.ly link.", "scan_type": "message", "score": 84},
    {"pattern_summary": "UPI handle support-refund@okaxis used across multiple fake refund scams.", "scan_type": "payment", "score": 88},
]


def run():
    init_db()
    db = SessionLocal()
    try:
        if db.query(ScanRecord).filter(ScanRecord.is_seed == True).count() > 0:
            print("Seed data already present — skipping. (Delete scamshield.db to reseed.)")
            return

        base_time = dt.datetime.utcnow() - dt.timedelta(days=14)
        for i, s in enumerate(SCENARIOS):
            fused = s["build"]()
            record = ScanRecord(
                id=gen_id(),
                user_id=None,
                scan_type=s["scan_type"],
                input_summary=s["summary"],
                score=fused["score"],
                level=fused["level"],
                why_json=json.dumps(fused["why"]),
                actions_json=json.dumps(fused["what_to_do"]),
                evidence_json=json.dumps(fused["technical_evidence"]),
                is_seed=True,
                created_at=base_time + dt.timedelta(days=i),
            )
            db.add(record)
            print(f"Seeded [{s['scan_type']:8}] {s['label']:45} -> {fused['score']:3}/100 {fused['level']}")

        for r in COMMUNITY_REPORTS:
            db.add(CommunityReport(id=gen_id(), scan_id=None, **r, reporter_note="Reported by community"))

        db.commit()
        print(f"\nSeeded {len(SCENARIOS)} scan scenarios and {len(COMMUNITY_REPORTS)} community reports.")
    finally:
        db.close()


if __name__ == "__main__":
    run()
