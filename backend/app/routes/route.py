import math
import requests
from flask import Blueprint, request, jsonify

bp = Blueprint("route", __name__)

OSRM_BASE_URL = "https://router.project-osrm.org/route/v1/driving"

def get_distance_meters(lat1, lon1, lat2, lon2):
    # Haversine formula
    R = 6371000  # radius of Earth in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def call_osrm(coords):
    # coords is list of (lat, lon)
    coord_str = ";".join([f"{lon},{lat}" for lat, lon in coords])
    url = f"{OSRM_BASE_URL}/{coord_str}?overview=full&geometries=geojson"
    try:
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        if data.get("code") == "Ok" and data.get("routes"):
            route = data["routes"][0]
            return {
                "geometry": route["geometry"],
                "distance_m": route["distance"],
                "duration_s": route["duration"],
            }
    except Exception as e:
        print(f"OSRM request failed: {e}")
    return None

@bp.route("/api/route", methods=["GET"])
def get_route():
    try:
        from_lat = float(request.args.get("from_lat"))
        from_lng = float(request.args.get("from_lng"))
        to_lat = float(request.args.get("to_lat"))
        to_lng = float(request.args.get("to_lng"))
    except (TypeError, ValueError):
        return jsonify({"error": "Missing or invalid coordinates"}), 400

    risk_lat = request.args.get("risk_lat")
    risk_lng = request.args.get("risk_lng")
    risk_score = request.args.get("risk_score")

    # Get shortest route directly A -> B
    shortest = call_osrm([(from_lat, from_lng), (to_lat, to_lng)])
    if not shortest:
        return jsonify({"error": "Could not calculate direct route"}), 502

    flood_safe = None
    bypassed = False

    # Check if we should calculate a flood-safe bypass
    if risk_lat and risk_lng and risk_score:
        try:
            rlat = float(risk_lat)
            rlng = float(risk_lng)
            rscore = float(risk_score)
            
            # Flood risk zone circle radius (minimum 1500m)
            r_flood = max(1500.0, rscore * 60.0)
            
            # Find closest point on segment AB to flood center C
            d_lat = to_lat - from_lat
            d_lng = to_lng - from_lng
            d_len_sq = d_lat**2 + d_lng**2

            if d_len_sq > 0:
                t = ((rlat - from_lat) * d_lat + (rlng - from_lng) * d_lng) / d_len_sq
                t = max(0.0, min(1.0, t))
                
                closest_lat = from_lat + t * d_lat
                closest_lng = from_lng + t * d_lng
                
                dist_to_flood_center = get_distance_meters(closest_lat, closest_lng, rlat, rlng)
                
                # If the route cuts within the flood risk radius plus a 500m safety buffer
                if dist_to_flood_center < (r_flood + 500.0):
                    # Compute perpendicular vector
                    d_len = math.sqrt(d_len_sq)
                    p_lat = -d_lng / d_len
                    p_lng = d_lat / d_len
                    
                    # Convert offset from meters to approximate degrees
                    offset_m = r_flood + 1000.0  # 1km buffer past the risk zone
                    offset_lat = (offset_m / 111000.0) * p_lat
                    offset_lng = (offset_m / (111000.0 * math.cos(math.radians(closest_lat)))) * p_lng
                    
                    # Candidate bypass points
                    w1 = (closest_lat + offset_lat, closest_lng + offset_lng)
                    w2 = (closest_lat - offset_lat, closest_lng - offset_lng)
                    
                    # Choose the candidate further away from the flood risk center
                    dist_w1 = get_distance_meters(w1[0], w1[1], rlat, rlng)
                    dist_w2 = get_distance_meters(w2[0], w2[1], rlat, rlng)
                    wp = w1 if dist_w1 > dist_w2 else w2
                    
                    # Call OSRM with midpoint waypoint
                    safe_route = call_osrm([(from_lat, from_lng), wp, (to_lat, to_lng)])
                    if safe_route:
                        flood_safe = safe_route
                        bypassed = True
        except Exception as e:
            print(f"Error calculating bypass: {e}")

    # Fallback to shortest if bypass wasn't needed or failed
    if not flood_safe:
        flood_safe = shortest

    return jsonify({
        "success": True,
        "shortest": shortest,
        "flood_safe": flood_safe,
        "bypassed": bypassed
    })
