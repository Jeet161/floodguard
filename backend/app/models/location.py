from sqlalchemy import Column, Integer, String, Float, DateTime, func
from app.database.connection import Base


class Location(Base):
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    country = Column(String(120))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
