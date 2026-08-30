from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field


class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: str = ""


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    name: str


class MessageScanRequest(BaseModel):
    text: str
    sender: Optional[str] = None


class UrlScanRequest(BaseModel):
    url: str


class QrScanRequest(BaseModel):
    payload: Optional[str] = None  # pre-decoded payload (webcam / client-side decode)
    image_base64: Optional[str] = None  # optional server-side decode path


class PaymentScanRequest(BaseModel):
    upi_id: Optional[str] = ""
    amount: Optional[float] = None
    note: Optional[str] = ""


class WhyItem(BaseModel):
    category: str
    detail: str
    weight: int


class ActionItem(BaseModel):
    action: str
    detail: str


class EvidenceItem(BaseModel):
    signal: str
    weight: int
    detail: str


class ScanResult(BaseModel):
    id: str
    scan_type: str
    score: int
    level: str
    why: List[WhyItem]
    what_to_do: List[ActionItem]
    technical_evidence: List[EvidenceItem]
    created_at: str


class ReportRequest(BaseModel):
    scan_id: Optional[str] = None
    pattern_summary: str
    scan_type: str
    score: int
    reporter_note: Optional[str] = ""
