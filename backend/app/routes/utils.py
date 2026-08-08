from flask import jsonify


def error_response(message: str, status: int = 400, details: str = None):
    body = {"error": message}
    if details:
        body["details"] = details
    return jsonify(body), status


def validate_coords(lat, lon):
    try:
        lat = float(lat)
        lon = float(lon)
    except (TypeError, ValueError):
        return None, None, "lat and lon must be valid numbers"
    if not (-90 <= lat <= 90) or not (-180 <= lon <= 180):
        return None, None, "lat/lon out of valid range"
    return lat, lon, None
