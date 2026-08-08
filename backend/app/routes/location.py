from flask import Blueprint, request
from app.routes.utils import error_response, validate_coords
from app.services.geocoding import search_location, reverse_geocode, find_important_locations, GeocodingError

bp = Blueprint("location", __name__)


@bp.route("/api/location/search", methods=["GET"])
def search():
    q = request.args.get("q", "").strip()
    if not q:
        return error_response("Query parameter 'q' is required.", 400)
    try:
        results = search_location(q)
        return {"success": True, "data": results}
    except GeocodingError as exc:
        return error_response("Location search is temporarily unavailable.", 502, str(exc))


@bp.route("/api/location/reverse", methods=["GET"])
def reverse():
    lat, lon, err = validate_coords(request.args.get("lat"), request.args.get("lon"))
    if err:
        return error_response(err, 400)
    try:
        result = reverse_geocode(lat, lon)
        return {"success": True, "data": result}
    except GeocodingError as exc:
        return error_response("Reverse geocoding is temporarily unavailable.", 502, str(exc))


@bp.route("/api/location/important", methods=["GET"])
def important():
    lat, lon, err = validate_coords(request.args.get("lat"), request.args.get("lon"))
    if err:
        return error_response(err, 400)
    radius = request.args.get("radius", 5000)
    try:
        radius = int(radius)
    except ValueError:
        radius = 5000
    try:
        places = find_important_locations(lat, lon, radius)
        return {"success": True, "data": places}
    except GeocodingError as exc:
        return error_response("Important-locations lookup is temporarily unavailable.", 502, str(exc))
