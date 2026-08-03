from sqlalchemy import Column, Integer, String
from app.core.database import Base
from sqlalchemy.orm import relationship


class Feeder(Base):
    __tablename__ = "feeders"

    id = Column(Integer, primary_key=True, index=True)

    feeder_code = Column(String, unique=True, nullable=False)

    name = Column(String, nullable=False)

    location = Column(String)

    transformers = relationship(
        "Transformer",
        back_populates="feeder"
    )