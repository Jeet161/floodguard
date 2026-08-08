from flask import Blueprint, request
from app.routes.utils import error_response, validate_coords
from app.services.openmeteo_flood import fetch_flood, FloodServiceError

bp = Blueprint("flood", __name__)


@bp.route("/api/flood", methods=["GET"])
def get_flood():
    lat, lon, err = validate_coords(request.args.get("lat"), request.args.get("lon"))
    if err:
        return error_response(err, 400)
    try:
        data = fetch_flood(lat, lon)
        return {"success": True, "data": data}
    except FloodServiceError as exc:
        return error_response("Flood/river data is temporarily unavailable.", 502, str(exc))
