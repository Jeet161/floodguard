"""Open-Meteo Weather API integration.

Docs: https://open-meteo.com/en/docs
No API key required.
"""
import requests
from app.config import Config
from app.services.cache import get_weather_cache, cache_key


class WeatherServiceError(Exception):
    pass


def fetch_weather(lat: float, lon: float) -> dict:
    """Fetch current + hourly + daily weather for a coordinate.

    Returns a normalized dict. Raises WeatherServiceError on failure so
    routes can degrade gracefully instead of crashing.
    """
    cache = get_weather_cache()
    key = cache_key(lat, lon)
    if key in cache:
        return cache[key]

    params = {
        "latitude": lat,
        "longitude": lon,
        "current": ",".join([
            "temperature_2m",
            "precipitation",
            "rain",
            "weather_code",
            "wind_speed_10m",
            "relative_humidity_2m",
        ]),
        "hourly": ",".join([
            "temperature_2m",
            "precipitation",
            "precipitation_probability",
            "rain",
            "weather_code",
        ]),
        "daily": ",".join([
            "precipitation_sum",
            "precipitation_probability_max",
            "temperature_2m_max",
            "temperature_2m_min",
            "weather_code",
        ]),
        "forecast_days": 7,
        "timezone": "auto",
    }

    try:
        resp = requests.get(Config.OPEN_METEO_WEATHER_URL, params=params, timeout=Config.REQUEST_TIMEOUT)
        resp.raise_for_status()
        data = resp.json()
    except requests.RequestException as exc:
        raise WeatherServiceError(f"Open-Meteo weather request failed: {exc}") from exc
    except ValueError as exc:
        raise WeatherServiceError(f"Open-Meteo weather returned invalid JSON: {exc}") from exc

    normalized = _normalize(data)
    cache[key] = normalized
    return normalized


def _normalize(data: dict) -> dict:
    current = data.get("current", {})
    hourly = data.get("hourly", {})
    daily = data.get("daily", {})

    hourly_series = []
    times = hourly.get("time", [])
    precip = hourly.get("precipitation", [])
    precip_prob = hourly.get("precipitation_probability", [])
    temps = hourly.get("temperature_2m", [])
    for i in range(min(48, len(times))):
        hourly_series.append({
            "time": times[i],
            "temperature_c": temps[i] if i < len(temps) else None,
            "precipitation_mm": precip[i] if i < len(precip) else None,
            "precipitation_probability": precip_prob[i] if i < len(precip_prob) else None,
        })

    daily_series = []
    d_times = daily.get("time", [])
    d_precip = daily.get("precipitation_sum", [])
    d_precip_prob = daily.get("precipitation_probability_max", [])
    d_tmax = daily.get("temperature_2m_max", [])
    d_tmin = daily.get("temperature_2m_min", [])
    for i in range(len(d_times)):
        daily_series.append({
            "date": d_times[i],
            "precipitation_sum_mm": d_precip[i] if i < len(d_precip) else None,
            "precipitation_probability_max": d_precip_prob[i] if i < len(d_precip_prob) else None,
            "temp_max_c": d_tmax[i] if i < len(d_tmax) else None,
            "temp_min_c": d_tmin[i] if i < len(d_tmin) else None,
        })

    # Rainfall expected in next 12 / 24 hours, used by the risk engine
    next_12h = sum(h["precipitation_mm"] for h in hourly_series[:12] if h["precipitation_mm"] is not None)
    next_24h = sum(h["precipitation_mm"] for h in hourly_series[:24] if h["precipitation_mm"] is not None)

    return {
        "current": {
            "temperature_c": current.get("temperature_2m"),
            "precipitation_mm": current.get("precipitation"),
            "rain_mm": current.get("rain"),
            "weather_code": current.get("weather_code"),
            "wind_speed_kmh": current.get("wind_speed_10m"),
            "relative_humidity": current.get("relative_humidity_2m"),
            "time": current.get("time"),
        },
        "hourly": hourly_series,
        "daily": daily_series,
        "forecast_rain_next_12h_mm": round(next_12h, 2),
        "forecast_rain_next_24h_mm": round(next_24h, 2),
        "source": "Open-Meteo Weather API",
        "timezone": data.get("timezone"),
    }
