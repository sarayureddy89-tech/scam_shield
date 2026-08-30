"""
Risk Fusion Engine
--------------------
Combines Risk / Threat / Financial signal groups from the individual
analyzers into one transparent 0-100 score. "Fusion" here = Rule Engine
(keyword/regex analyzers above) + weighted feature combination
(this module) + Threat Intelligence (mocked reputation/blacklist lookups
inside url/payment analyzers) + Context (source/channel adjustments).

The output always includes the full, auditable breakdown of every
contributing signal and its point value — never a black-box number.
"""

RISK_BANDS = [
    (0, 24, "LOW"),
    (25, 49, "MEDIUM"),
    (50, 74, "HIGH"),
    (75, 100, "CRITICAL"),
]

WHY_LABELS = {
    "Lookalike / typosquatted domain": "Impersonation",
    "Blacklisted domain": "Untrusted Source",
    "Reported scam UPI ID": "Untrusted Source",
    "Urgency language detected": "Urgency Detected",
    "Fear / threat trigger detected": "Urgency Detected",
    "Reward / greed bait detected": "Impersonation",
    "Requests sensitive credentials": "Financial Request",
    "Brand / authority impersonation": "Impersonation",
    "IP-based URL": "Suspicious URL",
    "Excessive subdomains": "Suspicious URL",
    "Suspicious top-level domain": "Suspicious URL",
    "Shortened / redirect link": "Suspicious URL",
    "Urgency/verification bait in URL": "Suspicious URL",
    "Malformed UPI handle": "Financial Request",
    "Unusually high payment amount": "Financial Request",
    "Payment request bundled with urgency/social-engineering language": "Financial Request",
    "Unrecognized PSP handle suffix": "Financial Request",
    "Lure keyword in UPI handle": "Financial Request",
    "QR encodes a UPI payment request": "Financial Request",
    "QR encodes a web link": "Suspicious URL",
    "High-pressure formatting": "Urgency Detected",
}

NEXT_ACTIONS = {
    "LOW": [
        {"action": "No immediate risk detected", "detail": "Standard caution still applies — never share OTPs unprompted."},
    ],
    "MEDIUM": [
        {"action": "Verify from Official Source", "detail": "Confirm the sender/link via the organization's official app or website before acting."},
        {"action": "Do Not Share OTP / Details", "detail": "Never share OTP, PIN, CVV, or passwords, even if asked politely."},
    ],
    "HIGH": [
        {"action": "Do Not Click", "detail": "Avoid opening the link or attachment."},
        {"action": "Do Not Share OTP / Details", "detail": "Never share OTP, PIN, CVV, PAN, or bank details."},
        {"action": "Do Not Make Payment", "detail": "Do not send money or scan the payment QR."},
        {"action": "Verify from Official Source", "detail": "Contact the organization directly using a number from their official website, not one given in the message."},
    ],
    "CRITICAL": [
        {"action": "Do Not Click", "detail": "This is very likely a scam — do not interact with the link at all."},
        {"action": "Do Not Share OTP / Details", "detail": "Never share OTP, PIN, CVV, PAN, or bank details."},
        {"action": "Do Not Make Payment", "detail": "Do not send money under any circumstance."},
        {"action": "Report if Needed", "detail": "Report this to your bank's fraud helpline and to cybercrime.gov.in."},
    ],
}


def score_to_level(score: int) -> str:
    score = max(0, min(100, score))
    for low, high, level in RISK_BANDS:
        if low <= score <= high:
            return level
    return "CRITICAL"


def fuse_signals(*signal_groups) -> dict:
    """
    signal_groups: any number of analyzer result dicts, each containing
    'signals' (list of {signal, weight, detail}) and 'risk_points' (int).

    Returns the fused, auditable result.
    """
    all_signals = []
    total_points = 0
    for group in signal_groups:
        if not group:
            continue
        all_signals.extend(group.get("signals", []))
        total_points += group.get("risk_points", 0)

    score = max(0, min(100, total_points))
    level = score_to_level(score)

    # WHY panel: dedupe by category label, keep the highest-weight explanation per category
    why_by_category = {}
    for s in all_signals:
        weight = s.get("weight", 0)
        if weight <= 0:
            continue
        category = WHY_LABELS.get(s["signal"], "Other Risk Indicator")
        if category not in why_by_category or weight > why_by_category[category]["weight"]:
            why_by_category[category] = {"category": category, "weight": weight, "detail": s["detail"], "signal": s["signal"]}

    why = sorted(why_by_category.values(), key=lambda x: -x["weight"])

    return {
        "score": score,
        "level": level,
        "why": why,
        "what_to_do": NEXT_ACTIONS[level],
        "technical_evidence": all_signals,  # full auditable breakdown, weights included
        "raw_points_before_clamp": total_points,
    }
