"""
Database layer — SQLAlchemy ORM.

Defaults to SQLite (zero-setup, file-based) so the app is demoable with a
single command and no external DB server. Swap to Postgres for production
by changing DATABASE_URL in .env — the models and queries are unchanged
because they go through the SQLAlchemy ORM rather than raw SQLite calls.
"""
import os
import uuid
import datetime as dt

from sqlalchemy import create_engine, Column, String, Integer, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import declarative_base, sessionmaker, relationship

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./scamshield.db")

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def gen_id() -> str:
    return uuid.uuid4().hex[:12]


class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=gen_id)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    name = Column(String, default="")
    created_at = Column(DateTime, default=dt.datetime.utcnow)

    scans = relationship("ScanRecord", back_populates="user")


class ScanRecord(Base):
    __tablename__ = "scans"
    id = Column(String, primary_key=True, default=gen_id)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)  # nullable → anonymous/demo scans allowed
    scan_type = Column(String, nullable=False)  # message | url | qr | payment
    input_summary = Column(Text, nullable=False)  # truncated raw input for history display
    score = Column(Integer, nullable=False)
    level = Column(String, nullable=False)
    why_json = Column(Text, nullable=False)       # JSON-serialized "why" list
    actions_json = Column(Text, nullable=False)   # JSON-serialized "what to do" list
    evidence_json = Column(Text, nullable=False)  # JSON-serialized full technical evidence
    is_seed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=dt.datetime.utcnow)

    user = relationship("User", back_populates="scans")


class CommunityReport(Base):
    __tablename__ = "community_reports"
    id = Column(String, primary_key=True, default=gen_id)
    scan_id = Column(String, ForeignKey("scans.id"), nullable=True)
    pattern_summary = Column(Text, nullable=False)
    scan_type = Column(String, nullable=False)
    score = Column(Integer, nullable=False)
    reporter_note = Column(Text, default="")
    created_at = Column(DateTime, default=dt.datetime.utcnow)


def init_db():
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
