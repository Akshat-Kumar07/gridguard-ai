from fastapi import FastAPI
from sqlalchemy import text

from app.core.config import settings
from app.core.database import engine

from app.api.telemetry import router as telemetry_router

from app.api.tickets import router as ticket_router
from app.api.faults import router as faults_router

from app.api.scheduled_outages import (
    router as scheduled_outage_router
)
from app.api.dashboard import router as dashboard_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Propel GridGuard AI API",
    description="AI-powered Smart Grid Fault Detection System",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://gridguard-ai-five.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "message": "Welcome to Propel GridGuard AI 🚀"
    }


@app.get("/db-test")
def db_test():
    with engine.connect() as connection:
        result = connection.execute(text("SELECT version();"))
        version = result.scalar()

    return {
        "database": version
    }


app.include_router(telemetry_router)
app.include_router(ticket_router)
app.include_router(scheduled_outage_router)
app.include_router(faults_router)
app.include_router(dashboard_router)