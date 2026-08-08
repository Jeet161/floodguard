from sqlalchemy import Column, Integer, String, Float, DateTime, Text, func
from app.database.connection import Base


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True)
    severity = Column(String(20), nullable=False)  # LOW, MODERATE, HIGH, CRITICAL
    title = Column(String(255), nullable=False)
    description = Column(Text)
    reason = Column(Text)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    location_name = Column(String(255))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
