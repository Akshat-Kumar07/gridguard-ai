from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models import Pole, Telemetry
from app.schemas.telemetry import TelemetryCreate

from app.services.telemetry_validator import validate_telemetry

from app.services.fault_service import process_fault

from datetime import datetime
from app.models import Ticket, Pole

from app.services.pole_status_service import update_pole_status


def create_telemetry(
    db: Session,
    telemetry: TelemetryCreate
):

    # Find pole using pole_code received from device
    pole = (
        db.query(Pole)
        .filter(Pole.pole_code == telemetry.pole_id)
        .first()
    )

    if not pole:
        raise HTTPException(
            status_code=404,
            detail=f"Pole '{telemetry.pole_id}' not found."
        )

    validation = validate_telemetry(
    db,
    telemetry
    )

    if not validation.valid:
        raise HTTPException(
            status_code=400,
            detail=validation.reason
        )

    telemetry_record = Telemetry(
        pole_id=pole.id,
        device_id=telemetry.device_id,
        event=telemetry.event,
        energized=telemetry.energized,
        ts=telemetry.ts,
        seq=telemetry.seq,
        battery_mv=telemetry.battery_mv,
        rssi=telemetry.rssi,
        fw=telemetry.fw
    )

    db.add(telemetry_record)
    db.commit()
    db.refresh(telemetry_record)

    update_pole_status(
    db,
    telemetry_record
)

    process_fault(
    db,
    telemetry_record
    )

    return telemetry_record