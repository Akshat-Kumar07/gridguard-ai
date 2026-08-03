from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.schemas.telemetry import TelemetryCreate
from app.services.telemetry_service import create_telemetry

router = APIRouter(
    prefix="/telemetry",
    tags=["Telemetry"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/")
def ingest_telemetry(
    telemetry: TelemetryCreate,
    db: Session = Depends(get_db)
):
    return create_telemetry(db, telemetry)