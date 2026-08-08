from flask import Blueprint, request
from app.routes.utils import error_response, validate_coords
from app.services.openmeteo_weather import fetch_weather, WeatherServiceError

bp = Blueprint("weather", __name__)


@bp.route("/api/weather", methods=["GET"])
def get_weather():
    lat, lon, err = validate_coords(request.args.get("lat"), request.args.get("lon"))
    if err:
        return error_response(err, 400)
    try:
        data = fetch_weather(lat, lon)
        return {"success": True, "data": data}
    except WeatherServiceError as exc:
        return error_response("Weather data is temporarily unavailable.", 502, str(exc))
