from sqlalchemy import (
    Column,
    Integer,
    Boolean,
    DateTime,
    String,
    ForeignKey
)

from sqlalchemy.orm import relationship

from datetime import datetime

from app.core.database import Base


class PoleStatus(Base):

    __tablename__ = "pole_status"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    pole_id = Column(
        Integer,
        ForeignKey("poles.id"),
        unique=True,
        nullable=False
    )

    energized = Column(
        Boolean,
        nullable=False
    )

    last_event = Column(
        String,
        nullable=False
    )

    last_seen = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    pole = relationship(
        "Pole"
    )