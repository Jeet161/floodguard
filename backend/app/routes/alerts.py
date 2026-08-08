from flask import Blueprint, request
from datetime import datetime, timezone
from app.routes.utils import error_response, validate_coords
from app.services.openmeteo_weather import fetch_weather, WeatherServiceError
from app.services.openmeteo_flood import fetch_flood, FloodServiceError
from app.risk_engine.calculator import calculate_risk
from app.database.connection import get_db_session, database_available

bp = Blueprint("alerts", __name__)


def _build_alerts(weather, flood, risk, lat, lon, name):
    alerts = []
    now = datetime.now(timezone.utc).isoformat()

    if risk["risk_level"] == "CRITICAL":
        alerts.append({
            "severity": "CRITICAL",
            "title": "Critical flood risk",
            "description": "Multiple strong flood risk indicators are present for this location.",
            "reason": "; ".join(risk["factors"][:3]),
            "timestamp": now,
        })
    elif risk["risk_level"] == "HIGH":
        alerts.append({
            "severity": "HIGH",
            "title": "High flood risk",
            "description": "Conditions indicate an elevated chance of flooding.",
            "reason": "; ".join(risk["factors"][:3]),
            "timestamp": now,
        })

    rain24 = weather.get("forecast_rain_next_24h_mm")
    if rain24 is not None and rain24 >= 50:
        alerts.append({
            "severity": "HIGH" if rain24 < 90 else "CRITICAL",
            "title": "Heavy rainfall expected",
            "description": f"{rain24:.0f} mm of rain forecast in the next 24 hours.",
            "reason": "Rainfall forecast threshold exceeded",
            "timestamp": now,
        })

    if flood.get("available") and flood.get("trend") == "increasing":
        alerts.append({
            "severity": "MODERATE",
            "title": "River discharge increasing",
            "description": "River discharge is trending upward according to GloFAS model data.",
            "reason": "Discharge trend classified as increasing",
            "timestamp": now,
        })

    if not alerts and risk["risk_level"] == "LOW":
        alerts.append({
            "severity": "LOW",
            "title": "Conditions stable",
            "description": "No significant flood risk indicators detected right now.",
            "reason": "Risk score below moderate threshold",
            "timestamp": now,
        })

    for a in alerts:
        a["latitude"] = lat
        a["longitude"] = lon
        a["location_name"] = name

    return alerts


@bp.route("/api/alerts", methods=["GET"])
def get_alerts():
    lat, lon, err = validate_coords(request.args.get("lat"), request.args.get("lon"))
    if err:
        return error_response(err, 400)
    name = request.args.get("name")

    try:
        weather = fetch_weather(lat, lon)
    except WeatherServiceError:
        weather = {"forecast_rain_next_24h_mm": None, "current": {}}
    try:
        flood = fetch_flood(lat, lon)
    except FloodServiceError:
        flood = {"available": False}

    risk = calculate_risk(weather, flood)
    alerts = _build_alerts(weather, flood, risk, lat, lon, name)

    if database_available():
        try:
            from app.models.alert import Alert
            with get_db_session() as session:
                if session is not None:
                    for a in alerts:
                        session.add(Alert(
                            severity=a["severity"], title=a["title"],
                            description=a["description"], reason=a["reason"],
                            latitude=lat, longitude=lon, location_name=name,
                        ))
        except Exception:
            pass

    return {"success": True, "data": alerts}
