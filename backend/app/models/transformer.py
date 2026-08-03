from sqlalchemy import Column, Integer, String, ForeignKey, Float
from sqlalchemy.orm import relationship

from app.core.database import Base


class Transformer(Base):
    __tablename__ = "transformers"

    id = Column(Integer, primary_key=True, index=True)

    transformer_code = Column(String, unique=True, nullable=False)

    name = Column(String, nullable=False)

    capacity_kva = Column(Integer)

    latitude = Column(Float)
    longitude = Column(Float)
    households_served = Column(Integer)

    feeder_id = Column(Integer, ForeignKey("feeders.id"))

    feeder = relationship("Feeder", back_populates="transformers")

    poles = relationship(
    "Pole",
    back_populates="transformer"
)