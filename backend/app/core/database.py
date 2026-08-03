from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.config import settings


# Create the database engine
engine = create_engine(
    settings.DATABASE_URL,
    echo=True
)


# Create a session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


# Base class for all database models
Base = declarative_base()


# Dependency for FastAPI
def get_db():
    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()