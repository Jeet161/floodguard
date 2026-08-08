from flask import Blueprint
from app.database.connection import database_available
from app.config import Config

bp = Blueprint("health", __name__)


@bp.route("/api/health", methods=["GET"])
def health():
    return {
        "success": True,
        "status": "ok",
        "database_configured": database_available(),
        "ai_configured": bool(Config.FEATHERLESS_API_KEY),
    }
