from flask import Blueprint, request
from app.routes.utils import error_response
from app.services.featherless import generate_analysis, AIServiceError

bp = Blueprint("ai", __name__)


@bp.route("/api/ai/analyze", methods=["POST"])
def analyze():
    body = request.get_json(silent=True) or {}
    required = ["risk_score", "risk_level"]
    if not all(k in body for k in required):
        return error_response("Request body must include structured risk data (risk_score, risk_level, etc).", 400)

    context = {
        "location": body.get("location_name", "Selected location"),
        "risk_score": body.get("risk_score"),
        "risk_level": body.get("risk_level"),
        "confidence": body.get("confidence"),
        "factors": body.get("factors", []),
        "rainfall_next_24h_mm": body.get("rainfall_next_24h_mm"),
        "rainfall_next_12h_mm": body.get("rainfall_next_12h_mm"),
        "river_discharge_current": body.get("river_discharge_current"),
        "river_discharge_peak_forecast": body.get("river_discharge_peak_forecast"),
        "river_discharge_trend": body.get("river_discharge_trend"),
    }

    try:
        result = generate_analysis(context)
        result["source"] = "featherless-ai"
        return {"success": True, "data": result}
    except AIServiceError as exc:
        # Graceful rule-based fallback so the UI never breaks without an AI key
        fallback = _fallback_analysis(context)
        fallback["source"] = "fallback-rule-based"
        fallback["ai_error"] = str(exc)
        return {"success": True, "data": fallback}


def _fallback_analysis(ctx: dict) -> dict:
    level = ctx.get("risk_level", "LOW")
    factors_text = "; ".join(ctx.get("factors") or []) or "no significant risk indicators"
    analysis = (
        f"Flood risk for {ctx.get('location')} is currently classified as {level} "
        f"based on: {factors_text}. This is an automated summary of backend-calculated data."
    )
    recs_by_level = {
        "LOW": ["Stay informed via local weather updates", "No immediate action required"],
        "MODERATE": ["Monitor forecasts over the next 24 hours", "Avoid low-lying areas after heavy rain",
                      "Keep emergency contacts handy"],
        "HIGH": ["Monitor local authority announcements closely", "Avoid unnecessary travel near rivers",
                  "Prepare essential supplies", "Move valuables to higher ground if in a flood-prone area"],
        "CRITICAL": ["Follow official evacuation guidance if issued", "Avoid all non-essential travel",
                     "Move to higher ground if in a flood-prone area", "Keep emergency supplies and documents ready",
                     "Stay connected to local emergency services"],
    }
    return {
        "analysis": analysis,
        "recommendations": recs_by_level.get(level, recs_by_level["LOW"]),
    }
