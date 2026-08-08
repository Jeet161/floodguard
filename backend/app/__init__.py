from flask import Flask, jsonify
from flask_cors import CORS
from app.config import Config
from app.database.connection import init_db


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app, resources={r"/api/*": {"origins": Config.CORS_ORIGINS}})

    from app.routes import weather, flood, risk, alerts, ai, location, health
    app.register_blueprint(weather.bp)
    app.register_blueprint(flood.bp)
    app.register_blueprint(risk.bp)
    app.register_blueprint(alerts.bp)
    app.register_blueprint(ai.bp)
    app.register_blueprint(location.bp)
    app.register_blueprint(health.bp)

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Not found"}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"error": "Internal server error"}), 500

    with app.app_context():
        init_db()

    return app
