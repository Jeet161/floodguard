from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, func
from app.database.connection import Base


class WeatherObservation(Base):
    __tablename__ = "weather_observations"

    id = Column(Integer, primary_key=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    temperature_c = Column(Float)
    precipitation_mm = Column(Float)
    precipitation_probability = Column(Float)
    wind_speed_kmh = Column(Float)
    weather_code = Column(Integer)
    raw = Column(JSON)
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())


class FloodObservation(Base):
    __tablename__ = "flood_observations"

    id = Column(Integer, primary_key=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    river_discharge = Column(Float)
    river_discharge_mean = Column(Float)
    river_discharge_max = Column(Float)
    raw = Column(JSON)
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())


class RiskAssessment(Base):
    __tablename__ = "risk_assessments"

    id = Column(Integer, primary_key=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    location_name = Column(String(255))
    risk_score = Column(Float, nullable=False)
    risk_level = Column(String(20), nullable=False)
    confidence = Column(Float)
    factors = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
