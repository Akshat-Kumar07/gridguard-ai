from datetime import datetime

from sqlalchemy.orm import Session

from app.models import ScheduledOutage


def get_scheduled_outages(
    db: Session,
    from_time: datetime,
    to_time: datetime
):

    return (
        db.query(ScheduledOutage)
        .filter(
            ScheduledOutage.start <= to_time,
            ScheduledOutage.end >= from_time
        )
        .all()
    )


def is_scheduled_outage(
    db: Session,
    feeder_code: str = None,
    transformer_code: str = None
):

    now = datetime.utcnow()

    outages = (
        db.query(ScheduledOutage)
        .filter(
            ScheduledOutage.start <= now,
            ScheduledOutage.end >= now
        )
        .all()
    )

    for outage in outages:

        if (
            outage.scope == "feeder"
            and outage.target_id == feeder_code
        ):
            return outage

        if (
            outage.scope == "dt"
            and outage.target_id == transformer_code
        ):
            return outage

    return None