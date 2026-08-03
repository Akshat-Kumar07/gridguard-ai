from datetime import datetime

from fastapi import APIRouter, Depends

from sqlalchemy.orm import Session

from app.core.database import get_db

from app.services.scheduled_outage_service import (
    get_scheduled_outages
)

router = APIRouter(
    prefix="/scheduled-outages",
    tags=["Scheduled Outages"]
)


@router.get("/")
def fetch_scheduled_outages(

    from_time: datetime,

    to_time: datetime,

    db: Session = Depends(get_db)

):

    return get_scheduled_outages(
        db,
        from_time,
        to_time
    )