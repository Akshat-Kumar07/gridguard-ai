from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models import (
    Feeder,
    Transformer,
    Pole,
    Ticket,
    ScheduledOutage
)

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/stats")
def dashboard_stats(
    db: Session = Depends(get_db)
):

    total_feeders = db.query(
        Feeder
    ).count()

    total_transformers = db.query(
        Transformer
    ).count()

    total_poles = db.query(
        Pole
    ).count()

    active_faults = db.query(
        Ticket
    ).filter(
        Ticket.status != "CLOSED"
    ).count()

    open_tickets = db.query(
        Ticket
    ).filter(
        Ticket.status != "CLOSED"
    ).count()

    scheduled_outages = db.query(
        ScheduledOutage
    ).count()

    return {

        "totalFeeders": total_feeders,

        "totalTransformers": total_transformers,

        "totalPoles": total_poles,

        "activeFaults": active_faults,

        "openTickets": open_tickets,

        "scheduledOutages": scheduled_outages

    }

@router.get("/feeders")
def get_feeders(
    db: Session = Depends(get_db)
):

    feeders = db.query(
        Feeder
    ).all()

    result = []

    for feeder in feeders:

        result.append({

            "id": feeder.id,

            "feeder_code": feeder.feeder_code,

            "name": feeder.name,

            "location": feeder.location

        })

    return result

@router.get("/transformers")
def get_transformers(
    db: Session = Depends(get_db)
):

    transformers = db.query(
        Transformer
    ).all()

    result = []

    for transformer in transformers:

        result.append({

            "id": transformer.id,

            "transformer_code": transformer.transformer_code,

            "name": transformer.name,

            "capacity_kva": transformer.capacity_kva,

            "latitude": transformer.latitude,

            "longitude": transformer.longitude,

            "households_served": transformer.households_served,

            "feeder_id": transformer.feeder_id

        })

    return result


@router.get("/poles")
def get_poles(
    db: Session = Depends(get_db)
):

    poles = db.query(
        Pole
    ).all()

    result = []

    for pole in poles:

        result.append({

            "id": pole.id,

            "pole_code": pole.pole_code,

            "latitude": pole.latitude,

            "longitude": pole.longitude,

            "device_id": pole.device_id,

            "seq_on_line": pole.seq_on_line,

            "pole_type": pole.pole_type,

            "ward": pole.ward,

            "pincode": pole.pincode,

            "is_active": pole.is_active,

            "transformer_id": pole.transformer_id,

            "parent_pole_id": pole.parent_pole_id,

            "transformer_code": pole.transformer.transformer_code
            if pole.transformer else None

        })

    return result