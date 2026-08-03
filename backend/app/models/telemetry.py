from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
    ForeignKey
)
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class Telemetry(Base):
    __tablename__ = "telemetry"

    id = Column(Integer, primary_key=True, index=True)

    pole_id = Column(
        Integer,
        ForeignKey("poles.id"),
        nullable=False
    )

    device_id = Column(
        String,
        nullable=False
    )

    event = Column(
        String,
        nullable=False
    )

    energized = Column(
        Boolean,
        nullable=False
    )

    ts = Column(
        DateTime,
        nullable=False
    )

    seq = Column(
        Integer,
        nullable=False
    )

    battery_mv = Column(
        Integer,
        nullable=False
    )

    rssi = Column(
        Integer,
        nullable=False
    )

    fw = Column(
        String,
        nullable=False
    )

    received_at = Column(
    DateTime,
    default=datetime.utcnow,
    nullable=False
)

    pole = relationship(
        "Pole",
        back_populates="telemetry"
    )