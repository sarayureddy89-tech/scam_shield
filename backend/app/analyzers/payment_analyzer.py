"""
Payment / Financial-Risk Analyzer
-----------------------------------
Validates UPI-style payment requests and flags financial-pressure patterns.
Stdlib only.
"""
import re

from .nlp_analyzer import analyze_text

UPI_RE = re.compile(r"^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z][a-zA-Z0-9.\-]{1,64}$")

KNOWN_PSP_HANDLES = {
    "okhdfcbank", "okaxis", "oksbi", "okicici", "ybl", "paytm", "apl", "ibl", "axl", "upi",
}

# Handles seen in confirmed community-reported scams (mocked threat list).
FLAGGED_UPI_HANDLES = {"support-refund@okaxis", "kyc-update@ybl", "cashback-claim@paytm"}

HIGH_AMOUNT_THRESHOLD = 25000  # INR — above this for an unsolicited request is a flag


def analyze_payment(upi_id: str = "", amount: float = None, note: str = "") -> dict:
    signals = []
    risk_points = 0

    upi_id = (upi_id or "").strip()
    if upi_id:
        if not UPI_RE.match(upi_id):
            signals.append({"signal": "Malformed UPI handle", "weight": 25,
                             "detail": f"'{upi_id}' does not match a valid UPI ID format (name@psp)."})
            risk_points += 25
        else:
            psp = upi_id.split("@")[-1].lower()
            if psp not in KNOWN_PSP_HANDLES:
                signals.append({"signal": "Unrecognized PSP handle suffix", "weight": 10,
                                 "detail": f"'@{psp}' is not a widely recognized payment service provider suffix."})
                risk_points += 10

        if upi_id.lower() in FLAGGED_UPI_HANDLES:
            signals.append({"signal": "Reported scam UPI ID", "weight": 35,
                             "detail": "This exact UPI handle has been reported by the community as fraudulent."})
            risk_points += 35

        # Lure keywords baked into the handle itself
        lure_in_handle = [w for w in ["refund", "kyc", "cashback", "reward", "verify", "support"] if w in upi_id.lower()]
        if lure_in_handle:
            signals.append({"signal": "Lure keyword in UPI handle", "weight": 10,
                             "detail": f"Handle contains suspicious lure word(s): {', '.join(lure_in_handle)}."})
            risk_points += 10

    if amount is not None and amount >= HIGH_AMOUNT_THRESHOLD:
        signals.append({"signal": "Unusually high payment amount", "weight": 15,
                         "detail": f"Requested amount ₹{amount:,.0f} is unusually high for an unsolicited/unknown request."})
        risk_points += 15

    if note:
        text_result = analyze_text(note)
        if text_result["risk_points"] > 0:
            signals.append({"signal": "Payment request bundled with urgency/social-engineering language",
                             "weight": 15,
                             "detail": "The accompanying message uses manipulation tactics alongside the payment ask."})
            risk_points += 15
            signals.extend(text_result["signals"])
            risk_points += text_result["risk_points"]

    return {
        "upi_id": upi_id,
        "amount": amount,
        "signals": signals,
        "risk_points": risk_points,
    }
