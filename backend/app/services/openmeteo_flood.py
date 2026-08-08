"""Open-Meteo Flood API (GloFAS-based river discharge) integration.

Docs: https://open-meteo.com/en/docs/flood-api
No API key required. Coverage: global rivers, model-based (GloFAS v4).
Not every coordinate sits on a modeled river reach - in that case the
API returns null series and we report "data unavailable" rather than
fabricating numbers.
"""
import requests
from app.config import Config
from app.services.cache import get_flood_cache, cache_key


class FloodServiceError(Exception):
    pass


def fetch_flood(lat: float, lon: float) -> dict:
    cache = get_flood_cache()
    key = cache_key(lat, lon)
    if key in cache:
        return cache[key]

    params = {
        "latitude": lat,
        "longitude": lon,
        "daily": "river_discharge,river_discharge_mean,river_discharge_max,river_discharge_min",
        "forecast_days": 14,
        "past_days": 7,
    }

    try:
        resp = requests.get(Config.OPEN_METEO_FLOOD_URL, params=params, timeout=Config.REQUEST_TIMEOUT)
        resp.raise_for_status()
        data = resp.json()
    except requests.RequestException as exc:
        raise FloodServiceError(f"Open-Meteo flood request failed: {exc}") from exc
    except ValueError as exc:
        raise FloodServiceError(f"Open-Meteo flood returned invalid JSON: {exc}") from exc

    normalized = _normalize(data)
    cache[key] = normalized
    return normalized


def _normalize(data: dict) -> dict:
    daily = data.get("daily", {})
    times = daily.get("time", [])
    discharge = daily.get("river_discharge", [])
    discharge_mean = daily.get("river_discharge_mean", [])
    discharge_max = daily.get("river_discharge_max", [])

    has_data = bool(times) and any(v is not None for v in discharge)

    series = []
    for i in range(len(times)):
        series.append({
            "date": times[i],
            "river_discharge": discharge[i] if i < len(discharge) else None,
            "river_discharge_mean": discharge_mean[i] if i < len(discharge_mean) else None,
            "river_discharge_max": discharge_max[i] if i < len(discharge_max) else None,
        })

    current_discharge = None
    peak_forecast_discharge = None
    trend = "unknown"

    if has_data:
        # past_days=7 means index 6 is "today" (last of the past window)
        today_idx = min(6, len(series) - 1)
        current_discharge = series[today_idx]["river_discharge"]

        future = series[today_idx:]
        future_vals = [f["river_discharge"] for f in future if f["river_discharge"] is not None]
        if future_vals:
            peak_forecast_discharge = max(future_vals)

        past_vals = [s["river_discharge"] for s in series[:today_idx + 1] if s["river_discharge"] is not None]
        future_short = [s["river_discharge"] for s in series[today_idx:today_idx + 4] if s["river_discharge"] is not None]
        if len(past_vals) >= 2 and future_short:
            recent_avg = sum(past_vals[-3:]) / len(past_vals[-3:])
            upcoming_avg = sum(future_short) / len(future_short)
            if upcoming_avg > recent_avg * 1.1:
                trend = "increasing"
            elif upcoming_avg < recent_avg * 0.9:
                trend = "decreasing"
            else:
                trend = "stable"

    return {
        "available": has_data,
        "daily": series,
        "current_discharge_m3s": current_discharge,
        "peak_forecast_discharge_m3s": peak_forecast_discharge,
        "trend": trend,
        "source": "Open-Meteo Flood API (GloFAS v4)",
        "note": None if has_data else "No modeled river reach found near this coordinate - river discharge data is unavailable.",
    }
