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

    # Sample primary location and nearby points in ~20km radius (to snap to major river stems like Gandak)
    sample_coords = [
        (lat, lon),
        (lat + 0.18, lon - 0.05),
        (lat + 0.1, lon + 0.15),
        (lat - 0.1, lon + 0.15),
        (lat + 0.15, lon - 0.15),
        (lat - 0.15, lon - 0.15),
        (lat + 0.08, lon + 0.08),
        (lat - 0.08, lon - 0.08),
    ]

    lats_str = ",".join(f"{c[0]:.4f}" for c in sample_coords)
    lons_str = ",".join(f"{c[1]:.4f}" for c in sample_coords)

    params = {
        "latitude": lats_str,
        "longitude": lons_str,
        "daily": "river_discharge,river_discharge_mean,river_discharge_max,river_discharge_min",
        "forecast_days": 14,
        "past_days": 7,
    }

    try:
        resp = requests.get(Config.OPEN_METEO_FLOOD_URL, params=params, timeout=Config.REQUEST_TIMEOUT)
        resp.raise_for_status()
        raw_data = resp.json()
    except requests.RequestException as exc:
        raise FloodServiceError(f"Open-Meteo flood request failed: {exc}") from exc
    except ValueError as exc:
        raise FloodServiceError(f"Open-Meteo flood returned invalid JSON: {exc}") from exc

    # If list of results returned, select the best river reach (highest discharge or primary)
    if isinstance(raw_data, list) and len(raw_data) > 0:
        best_data = raw_data[0]
        max_disc = 0.0
        is_snapped = False
        for item in raw_data:
            discharge_list = (item.get("daily") or {}).get("river_discharge") or []
            valid_vals = [v for v in discharge_list if v is not None]
            if valid_vals:
                cur_val = valid_vals[min(6, len(valid_vals) - 1)]
                if cur_val > max_disc:
                    max_disc = cur_val
                    best_data = item
                    is_snapped = (item != raw_data[0])
        data = best_data
    else:
        data = raw_data
        is_snapped = False

    normalized = _normalize(data, is_snapped=is_snapped)
    cache[key] = normalized
    return normalized


def _normalize(data: dict, is_snapped: bool = False) -> dict:
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
            if upcoming_avg > recent_avg * 1.05:
                trend = "increasing"
            elif upcoming_avg < recent_avg * 0.95:
                trend = "decreasing"
            else:
                trend = "stable"

    note = None
    if is_snapped and has_data:
        note = "River discharge snapped to nearest major river reach within 20km."
    elif not has_data:
        note = "No modeled river reach found near this coordinate - river discharge data is unavailable."

    return {
        "available": has_data,
        "daily": series,
        "current_discharge_m3s": current_discharge,
        "peak_forecast_discharge_m3s": peak_forecast_discharge,
        "trend": trend,
        "source": "Open-Meteo Flood API (GloFAS v4)",
        "note": note,
    }
