"""
Social-Engineering / NLP Detection
-----------------------------------
Rule + keyword + regex based classifier (stdlib only). This is the
"lightweight ML/NLP approach that runs fully offline" called for in the
spec: transparent, auditable, and swappable later for a trained model
behind the same `analyze_text()` interface.
"""
import re

URGENCY_PHRASES = [
    "act now", "immediately", "within 24 hours", "account will be blocked",
    "account has been suspended", "urgent action required", "expires today",
    "last warning", "final notice", "act fast", "limited time", "right away",
]

REWARD_PHRASES = [
    "you have won", "you've won", "congratulations", "claim your prize",
    "cashback", "lucky winner", "free gift", "you are selected", "lottery",
    "reward points expiring",
]

FEAR_PHRASES = [
    "legal action", "account suspended", "unauthorized access detected",
    "your account will be locked", "penalty", "police complaint", "arrest warrant",
    "税", "fraud detected on your account", "security alert",
]

CREDENTIAL_REQUEST_PATTERNS = [
    r"\botp\b", r"\bpan\b\s*(card|number)?", r"cvv", r"\bpin\b",
    r"bank\s*(account\s*)?(number|details)", r"aadhaar", r"password",
    r"card\s*number", r"share your (otp|pin|cvv|password)",
]

IMPERSONATION_BRANDS = [
    "sbi", "hdfc bank", "icici bank", "axis bank", "paytm", "rbi", "income tax department",
    "indian post", "india post", "irctc", "uidai", "amazon", "flipkart", "whatsapp",
    "customs department", "fedex", "delivery agent", "courier",
]


def _count_matches(text: str, phrases) -> list:
    text_l = text.lower()
    return [p for p in phrases if p in text_l]


def _count_regex(text: str, patterns) -> list:
    text_l = text.lower()
    hits = []
    for pat in patterns:
        if re.search(pat, text_l):
            hits.append(pat.strip(r"\b"))
    return hits


def analyze_text(text: str) -> dict:
    signals = []
    risk_points = 0

    urgency_hits = _count_matches(text, URGENCY_PHRASES)
    if urgency_hits:
        signals.append({"signal": "Urgency language detected", "weight": 15,
                         "detail": f"Message pressures immediate action: \"{urgency_hits[0]}\"."})
        risk_points += 15

    reward_hits = _count_matches(text, REWARD_PHRASES)
    if reward_hits:
        signals.append({"signal": "Reward / greed bait detected", "weight": 18,
                         "detail": f"Message dangles an unexpected prize/reward: \"{reward_hits[0]}\"."})
        risk_points += 18

    fear_hits = _count_matches(text, FEAR_PHRASES)
    if fear_hits:
        signals.append({"signal": "Fear / threat trigger detected", "weight": 20,
                         "detail": f"Message threatens a negative consequence: \"{fear_hits[0]}\"."})
        risk_points += 20

    cred_hits = _count_regex(text, CREDENTIAL_REQUEST_PATTERNS)
    if cred_hits:
        signals.append({"signal": "Requests sensitive credentials", "weight": 30,
                         "detail": f"Message asks for sensitive data ({', '.join(sorted(set(cred_hits)))}); legitimate institutions never ask for this over SMS/email."})
        risk_points += 30

    text_l = text.lower()
    impersonated = [b for b in IMPERSONATION_BRANDS if b in text_l]
    if impersonated:
        signals.append({"signal": "Brand / authority impersonation", "weight": 12,
                         "detail": f"Message claims to be from: {', '.join(impersonated[:2])}."})
        risk_points += 12

    # Suspicious formatting: excessive caps / exclamation marks (spam signature)
    exclam_count = text.count("!")
    caps_words = re.findall(r"\b[A-Z]{4,}\b", text)
    if exclam_count >= 2 or len(caps_words) >= 2:
        signals.append({"signal": "High-pressure formatting", "weight": 5,
                         "detail": "Excessive exclamation marks / all-caps words, typical of mass scam blasts."})
        risk_points += 5

    return {
        "signals": signals,
        "risk_points": risk_points,
        "matched_urgency": urgency_hits,
        "matched_reward": reward_hits,
    }
