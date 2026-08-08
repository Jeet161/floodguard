"""Geocoding via OpenStreetMap Nominatim."""
import requests
from app.config import Config
from app.services.cache import get_geocode_cache


class GeocodingError(Exception):
    pass


HEADERS = {"User-Agent": "FloodGuard-Hackathon-App/1.0 (contact: team@floodguard.local)"}


def search_location(query: str, limit: int = 5) -> list:
    cache = get_geocode_cache()
    ck = f"search:{query.lower()}:{limit}"
    if ck in cache:
        return cache[ck]

    params = {
        "q": query,
        "format": "jsonv2",
        "limit": limit,
        "addressdetails": 1,
    }
    try:
        resp = requests.get(f"{Config.NOMINATIM_URL}/search", params=params, headers=HEADERS, timeout=Config.REQUEST_TIMEOUT)
        resp.raise_for_status()
        results = resp.json()
    except requests.RequestException as exc:
        raise GeocodingError(f"Geocoding request failed: {exc}") from exc

    normalized = [{
        "name": r.get("display_name"),
        "latitude": float(r["lat"]),
        "longitude": float(r["lon"]),
        "type": r.get("type"),
        "country": (r.get("address") or {}).get("country"),
    } for r in results]

    cache[ck] = normalized
    return normalized


def reverse_geocode(lat: float, lon: float) -> dict:
    cache = get_geocode_cache()
    ck = f"reverse:{round(lat,4)},{round(lon,4)}"
    if ck in cache:
        return cache[ck]

    params = {"lat": lat, "lon": lon, "format": "jsonv2"}
    try:
        resp = requests.get(f"{Config.NOMINATIM_URL}/reverse", params=params, headers=HEADERS, timeout=Config.REQUEST_TIMEOUT)
        resp.raise_for_status()
        r = resp.json()
    except requests.RequestException as exc:
        raise GeocodingError(f"Reverse geocoding failed: {exc}") from exc

    result = {
        "name": r.get("display_name", f"{lat:.4f}, {lon:.4f}"),
        "country": (r.get("address") or {}).get("country"),
    }
    cache[ck] = result
    return result


def find_important_locations(lat: float, lon: float, radius_m: int = 5000) -> list:
    """Query Overpass API for hospitals, shelters, police/fire stations near a point."""
    query = f"""
    [out:json][timeout:15];
    (
      node["amenity"="hospital"](around:{radius_m},{lat},{lon});
      node["amenity"="police"](around:{radius_m},{lat},{lon});
      node["amenity"="fire_station"](around:{radius_m},{lat},{lon});
      node["amenity"="shelter"](around:{radius_m},{lat},{lon});
      node["emergency"="assembly_point"](around:{radius_m},{lat},{lon});
    );
    out center 30;
    """
    try:
        resp = requests.post(Config.OVERPASS_URL, data={"data": query}, headers=HEADERS, timeout=15)
        resp.raise_for_status()
        data = resp.json()
    except requests.RequestException as exc:
        raise GeocodingError(f"Overpass request failed: {exc}") from exc

    places = []
    for el in data.get("elements", []):
        tags = el.get("tags", {})
        places.append({
            "id": el.get("id"),
            "name": tags.get("name", "Unnamed"),
            "type": tags.get("amenity") or tags.get("emergency") or "location",
            "latitude": el.get("lat"),
            "longitude": el.get("lon"),
        })
    return places
