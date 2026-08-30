"""
URL Intelligence Analyzer
--------------------------
Pure-python, dependency-free (stdlib only) so it is trivially testable and
runs fully offline. In production, `reputation_lookup()` is the seam where a
real WHOIS / Google Safe Browsing / VirusTotal call would be plugged in -
here it is backed by a small mocked/cached table so the demo never depends
on live internet access.
"""
import re
from urllib.parse import urlparse

# --- Reference data -------------------------------------------------------

KNOWN_BRAND_DOMAINS = [
    "sbi.co.in", "hdfcbank.com", "icicibank.com", "axisbank.com",
    "paytm.com", "phonepe.com", "google.com", "amazon.in", "amazon.com",
    "flipkart.com", "indiapost.gov.in", "irctc.co.in", "uidai.gov.in",
    "incometax.gov.in", "rbi.org.in", "whatsapp.com", "instagram.com",
]

SUSPICIOUS_TLDS = {".xyz", ".top", ".club", ".work", ".gq", ".tk", ".ml", ".cf", ".loan", ".click", ".zip"}

URL_SHORTENERS = {"bit.ly", "tinyurl.com", "t.co", "goo.gl", "is.gd", "cutt.ly", "rb.gy", "shorturl.at"}

# Mocked reputation / blacklist store — stand-in for a live threat-intel API.
MOCK_BLACKLIST = {
    "sbi-verify-kyc.xyz", "hdfcbank-secure-login.top", "paytm-cashback-claim.club",
    "amaz0n-offers.top", "indiapost-redelivery.xyz", "irctc-refund.click",
}
MOCK_WHITELIST = set(KNOWN_BRAND_DOMAINS)

IP_URL_RE = re.compile(r"^\d{1,3}(\.\d{1,3}){3}$")


def _levenshtein(a: str, b: str) -> int:
    if a == b:
        return 0
    if len(a) < len(b):
        a, b = b, a
    prev = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        cur = [i] + [0] * len(b)
        for j, cb in enumerate(b, 1):
            cur[j] = min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (ca != cb))
        prev = cur
    return prev[-1]


def _closest_brand(domain: str):
    best, best_dist = None, 999
    root = domain.split(".")[0] if domain else ""
    for brand in KNOWN_BRAND_DOMAINS:
        brand_root = brand.split(".")[0]
        dist = _levenshtein(root, brand_root)
        if dist < best_dist:
            best, best_dist = brand, dist
    return best, best_dist


def reputation_lookup(domain: str) -> str:
    """Mocked threat-intel lookup with graceful offline fallback.
    Returns one of: 'blacklisted', 'trusted', 'unknown'.
    """
    if domain in MOCK_BLACKLIST:
        return "blacklisted"
    if domain in MOCK_WHITELIST:
        return "trusted"
    return "unknown"


def analyze_url(raw_url: str) -> dict:
    """Runs full URL intelligence pipeline. Returns a dict with:
    domain, score_contributions (list of signal dicts), risk_points, matched
    """
    signals = []
    risk_points = 0

    url = raw_url.strip()
    if not re.match(r"^[a-zA-Z]+://", url):
        url = "http://" + url  # allow bare domains

    parsed = urlparse(url)
    domain = (parsed.hostname or "").lower()
    subdomains = domain.split(".")[:-2] if domain.count(".") > 1 else []

    # 1. IP-based URL
    if domain and IP_URL_RE.match(domain):
        signals.append({"signal": "IP-based URL", "weight": 20,
                         "detail": "The link uses a raw IP address instead of a domain name, a common cloaking technique."})
        risk_points += 20

    # 2. Excessive subdomains
    if len(subdomains) >= 3:
        signals.append({"signal": "Excessive subdomains", "weight": 10,
                         "detail": f"URL has {len(subdomains)} nested subdomains ({'.'.join(subdomains)}), often used to disguise the real domain."})
        risk_points += 10

    # 3. Suspicious TLD
    for tld in SUSPICIOUS_TLDS:
        if domain.endswith(tld):
            signals.append({"signal": "Suspicious top-level domain", "weight": 15,
                             "detail": f"Domain ends in '{tld}', a TLD frequently abused for throwaway scam sites."})
            risk_points += 15
            break

    # 4. Shortened link
    if domain in URL_SHORTENERS:
        signals.append({"signal": "Shortened / redirect link", "weight": 12,
                         "detail": "Link uses a URL shortener, hiding the true destination until after a click."})
        risk_points += 12

    # 5. Typosquat / lookalike domain
    brand, dist = _closest_brand(domain)
    if brand and 0 < dist <= 2 and domain not in MOCK_WHITELIST:
        signals.append({"signal": "Lookalike / typosquatted domain", "weight": 25,
                         "detail": f"Domain '{domain}' closely resembles the trusted brand domain '{brand}' (edit distance {dist})."})
        risk_points += 25

    # 6. Reputation / blacklist
    rep = reputation_lookup(domain)
    if rep == "blacklisted":
        signals.append({"signal": "Blacklisted domain", "weight": 30,
                         "detail": "Domain appears in known scam/phishing threat-intelligence records."})
        risk_points += 30
    elif rep == "trusted":
        signals.append({"signal": "Trusted domain", "weight": -20,
                         "detail": "Domain matches a verified, trusted organization record."})
        risk_points -= 20

    # 7. Suspicious keywords in path/query masquerading as verification
    lure_words = ["verify", "kyc", "update-account", "secure-login", "claim", "refund", "reward", "unlock"]
    path_q = (parsed.path + "?" + parsed.query).lower()
    matched_lures = [w for w in lure_words if w in path_q or w.replace("-", "") in domain]
    if matched_lures:
        signals.append({"signal": "Urgency/verification bait in URL", "weight": 8,
                         "detail": f"URL path contains lure keyword(s): {', '.join(matched_lures)}."})
        risk_points += 8

    return {
        "domain": domain,
        "url": url,
        "signals": signals,
        "risk_points": risk_points,
    }
