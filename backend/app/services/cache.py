"""Very small in-memory TTL cache shared across services.

For a hackathon this is enough - avoids hammering free external APIs.
Not distributed, resets on server restart, which is fine for this use case.
"""
from cachetools import TTLCache
from app.config import Config

_weather_cache = TTLCache(maxsize=256, ttl=Config.CACHE_TTL_SECONDS)
_flood_cache = TTLCache(maxsize=256, ttl=Config.CACHE_TTL_SECONDS)
_geocode_cache = TTLCache(maxsize=512, ttl=3600)


def cache_key(lat: float, lon: float) -> str:
    return f"{round(lat, 3)},{round(lon, 3)}"


def get_weather_cache():
    return _weather_cache


def get_flood_cache():
    return _flood_cache


def get_geocode_cache():
    return _geocode_cache
