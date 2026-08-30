from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import init_db
from .routers import auth_router, scan_router, community_router

app = FastAPI(
    title="ScamShield API",
    description="AI-powered, explainable personal digital-safety and scam-prevention assistant. "
                 "Detect · Explain · Protect.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # relax for hackathon demo; restrict to frontend origin in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "ScamShield API"}


app.include_router(auth_router.router)
app.include_router(scan_router.router)
app.include_router(community_router.router)
