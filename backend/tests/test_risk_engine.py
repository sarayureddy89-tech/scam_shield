"""
Unit tests for the risk-scoring pipeline. Uses stdlib unittest only, so
these run even before FastAPI/SQLAlchemy are installed.

Run with:  python -m unittest discover -s tests
"""
import sys
import os
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.analyzers.url_analyzer import analyze_url
from app.analyzers.nlp_analyzer import analyze_text
from app.analyzers.payment_analyzer import analyze_payment
from app.analyzers.qr_analyzer import analyze_qr_payload
from app.analyzers.risk_fusion_engine import fuse_signals, score_to_level


class TestScoreToLevel(unittest.TestCase):
    def test_bands(self):
        self.assertEqual(score_to_level(0), "LOW")
        self.assertEqual(score_to_level(24), "LOW")
        self.assertEqual(score_to_level(25), "MEDIUM")
        self.assertEqual(score_to_level(49), "MEDIUM")
        self.assertEqual(score_to_level(50), "HIGH")
        self.assertEqual(score_to_level(74), "HIGH")
        self.assertEqual(score_to_level(75), "CRITICAL")
        self.assertEqual(score_to_level(100), "CRITICAL")

    def test_clamping(self):
        self.assertEqual(score_to_level(-10), "LOW")
        self.assertEqual(score_to_level(150), "CRITICAL")


class TestUrlAnalyzer(unittest.TestCase):
    def test_typosquat_flagged(self):
        result = analyze_url("http://hdfcbank-secure-login.top/auth")
        signal_names = [s["signal"] for s in result["signals"]]
        self.assertIn("Suspicious top-level domain", signal_names)
        self.assertGreater(result["risk_points"], 0)

    def test_trusted_domain_reduces_score(self):
        result = analyze_url("https://www.sbi.co.in/web/personal-banking")
        self.assertLessEqual(result["risk_points"], 0)

    def test_ip_based_url_flagged(self):
        result = analyze_url("http://192.168.1.50/login")
        signal_names = [s["signal"] for s in result["signals"]]
        self.assertIn("IP-based URL", signal_names)


class TestNlpAnalyzer(unittest.TestCase):
    def test_urgency_and_reward_detected(self):
        result = analyze_text("Congratulations! You have won a prize. Act now before it expires today!")
        signal_names = [s["signal"] for s in result["signals"]]
        self.assertIn("Reward / greed bait detected", signal_names)
        self.assertIn("Urgency language detected", signal_names)

    def test_credential_request_detected(self):
        result = analyze_text("Please share your OTP and CVV to verify your account.")
        signal_names = [s["signal"] for s in result["signals"]]
        self.assertIn("Requests sensitive credentials", signal_names)

    def test_benign_text_low_score(self):
        result = analyze_text("Hey, are we still meeting for lunch tomorrow?")
        self.assertEqual(result["risk_points"], 0)


class TestPaymentAnalyzer(unittest.TestCase):
    def test_malformed_upi_flagged(self):
        result = analyze_payment(upi_id="not-a-valid-upi")
        signal_names = [s["signal"] for s in result["signals"]]
        self.assertIn("Malformed UPI handle", signal_names)

    def test_high_amount_flagged(self):
        result = analyze_payment(upi_id="someone@oksbi", amount=50000)
        signal_names = [s["signal"] for s in result["signals"]]
        self.assertIn("Unusually high payment amount", signal_names)

    def test_legit_small_payment_low_risk(self):
        result = analyze_payment(upi_id="friend@okhdfcbank", amount=500, note="dinner split")
        self.assertLess(result["risk_points"], 15)


class TestQrAnalyzer(unittest.TestCase):
    def test_upi_qr_routes_to_payment_analyzer(self):
        result = analyze_qr_payload("upi://pay?pa=kyc-update@ybl&am=1&tn=verify now urgent")
        self.assertEqual(result["payload_type"], "upi_payment")
        self.assertGreater(result["risk_points"], 0)

    def test_url_qr_routes_to_url_analyzer(self):
        result = analyze_qr_payload("http://amaz0n-offers.top/win")
        self.assertEqual(result["payload_type"], "url")
        self.assertGreater(result["risk_points"], 0)

    def test_plain_text_qr(self):
        result = analyze_qr_payload("Just a wifi password reminder note")
        self.assertEqual(result["payload_type"], "text")
        self.assertEqual(result["risk_points"], 0)


class TestRiskFusionEngine(unittest.TestCase):
    def test_spec_example_flow_is_high_or_critical(self):
        """Reproduces the exact example from the product spec."""
        text_result = analyze_text("Congratulations! You won ₹25,000. Click this link to claim now!")
        url_result = analyze_url("http://sbi-verify-kyc.xyz/claim")
        fused = fuse_signals(text_result, url_result)
        self.assertGreaterEqual(fused["score"], 75)
        self.assertEqual(fused["level"], "CRITICAL")
        self.assertTrue(len(fused["why"]) > 0)
        self.assertTrue(len(fused["what_to_do"]) > 0)

    def test_safe_message_is_low(self):
        text_result = analyze_text("Your Amazon order has shipped and will arrive Thursday.")
        fused = fuse_signals(text_result)
        self.assertEqual(fused["level"], "LOW")

    def test_score_never_exceeds_100_or_below_0(self):
        text_result = analyze_text(
            "URGENT! Act now! You have won! Legal action! Share your OTP PIN CVV PAN Aadhaar bank account password immediately or account will be blocked!!"
        )
        url_result = analyze_url("http://192.168.1.1@sbi-verify-kyc.xyz/claim/verify/kyc")
        fused = fuse_signals(text_result, url_result)
        self.assertLessEqual(fused["score"], 100)
        self.assertGreaterEqual(fused["score"], 0)

    def test_technical_evidence_is_auditable(self):
        """Every WHY item must be traceable to a weighted technical signal — no black box."""
        url_result = analyze_url("http://sbi-verify-kyc.xyz/claim")
        fused = fuse_signals(url_result)
        for item in fused["technical_evidence"]:
            self.assertIn("signal", item)
            self.assertIn("weight", item)
            self.assertIn("detail", item)


if __name__ == "__main__":
    unittest.main()
