from flask import Blueprint, request
from app.routes.utils import error_response, validate_coords
from app.services.openmeteo_weather import fetch_weather, WeatherServiceError
from app.services.openmeteo_flood import fetch_flood, FloodServiceError
from app.risk_engine.calculator import calculate_risk
from app.database.connection import get_db_session, database_available

bp = Blueprint("risk", __name__)


@bp.route("/api/risk", methods=["GET"])
def get_risk():
    lat, lon, err = validate_coords(request.args.get("lat"), request.args.get("lon"))
    if err:
        return error_response(err, 400)

    weather, weather_err = {}, None
    flood, flood_err = {}, None

    try:
        weather = fetch_weather(lat, lon)
    except WeatherServiceError as exc:
        weather_err = str(exc)
        weather = {"forecast_rain_next_24h_mm": None, "forecast_rain_next_12h_mm": None, "current": {}}

    try:
        flood = fetch_flood(lat, lon)
    except FloodServiceError as exc:
        flood_err = str(exc)
        flood = {"available": False}

    if weather_err and flood_err:
        return error_response(
            "Unable to calculate risk - both weather and flood data sources are unavailable.",
            502,
        )

    risk = calculate_risk(weather, flood)
    risk["partial_data"] = bool(weather_err or flood_err)
    if weather_err:
        risk["warnings"] = risk.get("warnings", []) + ["Weather data unavailable - risk score may be incomplete."]
    if flood_err:
        risk["warnings"] = risk.get("warnings", []) + ["River discharge data unavailable - risk score may be incomplete."]

    if database_available():
        try:
            from app.models.observation import RiskAssessment
            with get_db_session() as session:
                if session is not None:
                    session.add(RiskAssessment(
                        latitude=lat, longitude=lon,
                        location_name=request.args.get("name"),
                        risk_score=risk["risk_score"],
                        risk_level=risk["risk_level"],
                        confidence=risk["confidence"],
                        factors=risk["factors"],
                    ))
        except Exception:
            pass  # persistence is best-effort, never block the response

    return {"success": True, "data": risk}
