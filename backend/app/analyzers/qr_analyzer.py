"""
QR / Payload Analyzer ("quishing" detection)
----------------------------------------------
Decodes a QR code image to its underlying payload, then routes that
payload back through the URL analyzer (if it's a link) or the payment
analyzer (if it's a UPI deep-link, e.g. `upi://pay?pa=...&am=...`).

Image decoding uses `pyzbar` + `Pillow` (see requirements.txt). Those
libraries need a system zbar install, which some judge laptops won't have -
so this module degrades gracefully: if decoding isn't available, the API
also accepts a pre-decoded `payload` string directly (e.g. from a webcam
scan performed client-side with a JS QR reader), which is what the seed
data / demo mode uses so the app never hard-depends on the native decoder.
"""
from urllib.parse import urlparse, parse_qs

from .url_analyzer import analyze_url
from .payment_analyzer import analyze_payment

try:
    from pyzbar.pyzbar import decode as _zbar_decode
    from PIL import Image
    _HAS_DECODER = True
except ImportError:  # pragma: no cover - offline demo environments
    _HAS_DECODER = False


def decode_qr_image(image_path: str) -> str | None:
    """Returns the decoded string payload of a QR image, or None."""
    if not _HAS_DECODER:
        return None
    try:
        img = Image.open(image_path)
        results = _zbar_decode(img)
        if results:
            return results[0].data.decode("utf-8", errors="ignore")
    except Exception:
        return None
    return None


def analyze_qr_payload(payload: str) -> dict:
    """Classifies the decoded payload and routes it to the right sub-analyzer."""
    signals = []
    risk_points = 0
    payload = (payload or "").strip()
    payload_type = "unknown"
    sub_result = None

    if payload.lower().startswith("upi://"):
        payload_type = "upi_payment"
        parsed = urlparse(payload)
        qs = parse_qs(parsed.query)
        pa = qs.get("pa", [""])[0]
        am = qs.get("am", [None])[0]
        note = qs.get("tn", [""])[0]
        amount = float(am) if am else None
        sub_result = analyze_payment(upi_id=pa, amount=amount, note=note)
        signals.append({"signal": "QR encodes a UPI payment request", "weight": 5,
                         "detail": f"Decoded QR requests payment to '{pa}'" + (f" for ₹{amount:,.0f}" if amount else "") + "."})
        risk_points += 5 + sub_result["risk_points"]
        signals.extend(sub_result["signals"])

    elif payload.lower().startswith(("http://", "https://")) or "." in payload:
        payload_type = "url"
        sub_result = analyze_url(payload)
        signals.append({"signal": "QR encodes a web link", "weight": 5,
                         "detail": f"Decoded QR points to '{sub_result['domain']}'. Analyzing as a URL ('quishing' check)."})
        risk_points += 5 + sub_result["risk_points"]
        signals.extend(sub_result["signals"])
    else:
        payload_type = "text"
        signals.append({"signal": "QR encodes plain text", "weight": 0,
                         "detail": "Decoded payload is plain text, not a link or payment request."})

    return {
        "payload": payload,
        "payload_type": payload_type,
        "signals": signals,
        "risk_points": risk_points,
    }
