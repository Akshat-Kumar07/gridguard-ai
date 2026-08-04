from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.schemas.telemetry import TelemetryCreate
from app.services.telemetry_service import create_telemetry
from app.models import Telemetry

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


@router.get("/")
def get_all_telemetry(
    db: Session = Depends(get_db)
):

    telemetry_records = (
        db.query(Telemetry)
        .order_by(
            Telemetry.received_at.desc()
        )
        .all()
    )

    result = []

    for telemetry in telemetry_records:

        result.append({

            "id": telemetry.id,

            "pole_id": telemetry.pole_id,

            "device_id": telemetry.device_id,

            "event": telemetry.event,

            "energized": telemetry.energized,

            "ts": telemetry.ts,

            "seq": telemetry.seq,

            "battery_mv": telemetry.battery_mv,

            "rssi": telemetry.rssi,

            "fw": telemetry.fw,

            "received_at": telemetry.received_at

        })

    return result