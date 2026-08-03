from sqlalchemy import Column, Integer, String, Boolean, Float, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base


class Pole(Base):
    __tablename__ = "poles"

    id = Column(Integer, primary_key=True, index=True)

    pole_code = Column(String, unique=True, nullable=False)

    latitude = Column(Float)

    longitude = Column(Float)

    

    device_id = Column(
    String,
    unique=True,
    nullable=True
)

    seq_on_line = Column(
    Integer,
    nullable=False
)

    pole_type = Column(
    String,
    nullable=True
)

    ward = Column(
    String,
    nullable=True
)

    pincode = Column(
    String,
    nullable=True
)

    is_active = Column(Boolean, default=True)

    transformer_id = Column(
        Integer,
        ForeignKey("transformers.id"),
        nullable=False
    )

    parent_pole_id = Column(
        Integer,
        ForeignKey("poles.id"),
        nullable=True
    )

    transformer = relationship(
        "Transformer",
        back_populates="poles"
    )

    parent = relationship(
        "Pole",
        remote_side=[id],
        backref="children"
    )

    telemetry = relationship(
    "Telemetry",
    back_populates="pole",
    cascade="all, delete-orphan"
)

    tickets = relationship(
    "Ticket",
    back_populates="pole",
    cascade="all, delete-orphan"
)