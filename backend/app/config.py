import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    DATABASE_URL = os.environ.get("DATABASE_URL", "")
    FEATHERLESS_API_KEY = os.environ.get("FEATHERLESS_API_KEY", "")
    FEATHERLESS_MODEL = os.environ.get("FEATHERLESS_MODEL", "meta-llama/Meta-Llama-3.1-8B-Instruct")
    FEATHERLESS_BASE_URL = os.environ.get("FEATHERLESS_BASE_URL", "https://api.featherless.ai/v1")
    CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "http://localhost:5173").split(",")
    OVERPASS_URL = os.environ.get("OVERPASS_URL", "https://overpass-api.de/api/interpreter")
    NOMINATIM_URL = os.environ.get("NOMINATIM_URL", "https://nominatim.openstreetmap.org")
    OPEN_METEO_WEATHER_URL = "https://api.open-meteo.com/v1/forecast"
    OPEN_METEO_FLOOD_URL = "https://flood-api.open-meteo.com/v1/flood"
    REQUEST_TIMEOUT = 12
    CACHE_TTL_SECONDS = 600  # 10 minutes
    DEBUG = os.environ.get("FLASK_ENV", "development") == "development"
