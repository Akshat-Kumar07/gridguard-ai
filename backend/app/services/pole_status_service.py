from datetime import datetime

from sqlalchemy.orm import Session

from app.models import PoleStatus


def update_pole_status(
    db: Session,
    telemetry
):

    status = (
        db.query(PoleStatus)
        .filter(
            PoleStatus.pole_id == telemetry.pole_id
        )
        .first()
    )

    if status:

        status.energized = telemetry.energized
        status.last_event = telemetry.event
        status.last_seen = datetime.utcnow()

    else:

        status = PoleStatus(
            pole_id=telemetry.pole_id,
            energized=telemetry.energized,
            last_event=telemetry.event,
            last_seen=datetime.utcnow()
        )

        db.add(status)

    db.commit()

    return status