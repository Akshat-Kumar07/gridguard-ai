from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime
)

from app.core.database import Base


class ScheduledOutage(Base):

    __tablename__ = "scheduled_outages"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    outage_id = Column(
        String,
        unique=True,
        nullable=False
    )

    scope = Column(
        String,
        nullable=False
    )

    target_id = Column(
        String,
        nullable=False
    )

    start = Column(
        DateTime,
        nullable=False
    )

    end = Column(
        DateTime,
        nullable=False
    )

    reason = Column(
        String,
        nullable=False
    )