from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base


class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)

    pole_id = Column(
        Integer,
        ForeignKey("poles.id"),
        nullable=False
    )

    title = Column(String, nullable=False)

    description = Column(String)

    status = Column(
        String,
        default="OPEN"
    )

    priority = Column(
        String,
        default="HIGH"
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    closed_at = Column(
        DateTime,
        nullable=True
    )

    pole = relationship(
        "Pole",
        back_populates="tickets"
    )