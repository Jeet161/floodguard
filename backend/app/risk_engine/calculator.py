"""
Flood Risk Engine
==================
Combines Open-Meteo weather (rainfall, forecast rainfall) and
Open-Meteo Flood/GloFAS (river discharge + trend) into a single
0-100 risk score with a human-readable classification and factor list.

This is an application-generated heuristic score, not a certified
hydrological forecast. It is designed to be transparent (every point
added is explainable) and easy to extend later with more inputs
(soil moisture, elevation, historical flood records, etc).
"""
from datetime import datetime, timezone
from app.risk_engine import thresholds as T
from app.risk_engine.scoring import classify_level, clamp


def calculate_risk(weather: dict, flood: dict) -> dict:
    score = 0.0
    factors = []
    confidence = 0.5  # baseline confidence, adjusted by data completeness below

    # --- Rainfall component (0-45 pts) ---
    rain_24h = weather.get("forecast_rain_next_24h_mm")
    rain_12h = weather.get("forecast_rain_next_12h_mm")

    if rain_24h is not None:
        if rain_24h >= T.RAIN_24H_CRITICAL:
            score += 30
            factors.append(f"Very heavy rainfall forecast over next 24h ({rain_24h:.0f} mm)")
        elif rain_24h >= T.RAIN_24H_HIGH:
            score += 20
            factors.append(f"Heavy rainfall forecast over next 24h ({rain_24h:.0f} mm)")
        elif rain_24h >= T.RAIN_24H_MODERATE:
            score += 10
            factors.append(f"Moderate rainfall forecast over next 24h ({rain_24h:.0f} mm)")
        confidence += 0.15

    if rain_12h is not None:
        if rain_12h >= T.RAIN_12H_CRITICAL:
            score += 15
            factors.append(f"Intense rainfall expected in next 12h ({rain_12h:.0f} mm)")
        elif rain_12h >= T.RAIN_12H_HIGH:
            score += 10
            factors.append(f"Significant rainfall expected in next 12h ({rain_12h:.0f} mm)")
        elif rain_12h >= T.RAIN_12H_MODERATE:
            score += 5
        confidence += 0.1

    # --- Current precipitation intensity (0-10 pts) ---
    current_precip = (weather.get("current") or {}).get("precipitation_mm")
    if current_precip is not None:
        if current_precip >= 10:
            score += 10
            factors.append(f"Heavy rain currently falling ({current_precip:.1f} mm/h)")
        elif current_precip >= 3:
            score += 5
            factors.append(f"Rain currently falling ({current_precip:.1f} mm/h)")

    # --- River discharge component (0-45 pts) ---
    if flood.get("available"):
        confidence += 0.2
        trend = flood.get("trend", "unknown")
        trend_pts = T.TREND_SCORE.get(trend, 0)
        score += trend_pts
        if trend == "increasing":
            factors.append("River discharge trend is increasing")
        elif trend == "decreasing":
            factors.append("River discharge trend is decreasing")

        current_discharge = flood.get("current_discharge_m3s")
        peak_discharge = flood.get("peak_forecast_discharge_m3s")
        if current_discharge and peak_discharge and current_discharge > 0:
            ratio = peak_discharge / current_discharge
            if ratio >= T.DISCHARGE_RATIO_CRITICAL:
                score += 25
                factors.append(f"Forecast discharge could rise {ratio:.1f}x above current levels")
            elif ratio >= T.DISCHARGE_RATIO_HIGH:
                score += 15
                factors.append(f"Forecast discharge could rise {ratio:.1f}x above current levels")
            elif ratio >= T.DISCHARGE_RATIO_MODERATE:
                score += 8
                factors.append(f"Forecast discharge trending {ratio:.1f}x above current levels")
    else:
        factors.append("River discharge data unavailable for this exact coordinate")

    score = clamp(score)
    level = classify_level(score)
    confidence = round(min(confidence, 0.9), 2)  # never claim full certainty

    if not factors:
        factors.append("No significant flood risk indicators detected in available data")

    return {
        "risk_score": round(score, 1),
        "risk_level": level,
        "confidence": confidence,
        "factors": factors,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "disclaimer": (
            "This is an application-generated risk estimate based on available weather and "
            "river-discharge model data. It is not an official government flood warning."
        ),
    }
