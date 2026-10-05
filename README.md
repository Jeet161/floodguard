# 🌊 FloodGuard — Flood Control & Early Warning Platform

![Python Version](https://img.shields.io/badge/Python-3.10%2B-blue?logo=python&logoColor=white)
![Flask Framework](https://img.shields.io/badge/Backend-Flask-000000?logo=flask&logoColor=white)
![React Framework](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?logo=react&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-green)
![Data Source](https://img.shields.io/badge/Data-Open--Meteo%20%7C%20GloFAS-orange)

> **Real-time flood intelligence, hydrological risk monitoring, safe route assessment, and AI-powered early warning briefings.**

FloodGuard combines live OpenStreetMap geospatial data, Open-Meteo weather forecasts, GloFAS river discharge hydrographs, a transparent Python risk-scoring engine, and Featherless AI natural-language interpretation into a single dashboard.

---

## 📚 Project Documentation

Looking for detailed technical documentation or academic project reports?
- 📄 **[Python Academic & Project Documentation (For Evaluators / Teachers)](PROJECT_DOCUMENTATION_FOR_TEACHER.md)**: Detailed breakdown of Python architecture, algorithms, risk scoring mathematical model, design patterns, ORM models, and API integrations.

---

## ✨ Core Features

- 🗺️ **Interactive Flood Map (Leaflet + OpenStreetMap)**: Live location search, danger zone overlays, and critical infrastructure markers (hospitals, shelters, fire stations, police) powered by Overpass API.
- 🧮 **Transparent Flood Risk Engine**: Python-calculated $0–100$ heuristic score (**LOW**, **MODERATE**, **HIGH**, **CRITICAL**) based on 24h/12h rainfall forecast, 7-day cumulative precipitation, current rain rate, and GloFAS river discharge trends.
- 🌦️ **Live Weather Monitoring**: Real-time atmospheric metrics and 7-day weather predictions via Open-Meteo Weather API.
- 🌊 **River Discharge Hydrographs**: Current flow rate ($m^3/s$), 14-day forecast trends, and peak surge ratios via Open-Meteo Flood API (GloFAS v4 model).
- 🛣️ **Safe Route Flood Assessment**: Evaluate flood risk along custom travel routes to identify safe navigation paths.
- 🤖 **AI Situation Analysis**: Featherless AI translates backend data into plain-language preparedness briefings with a built-in rule-based fallback system if API keys are missing.
- 🔔 **Rule-Based Emergency Alerts**: Instant warning triggers for high precipitation thresholds or rapid discharge spikes.
- 📱 **Fully Responsive Layout**: Built with modern UI design principles for seamless experience across mobile, tablet, and desktop screens.

---

## 🏗️ Technical Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    React (Vite) + Leaflet                    │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST API / HTTP
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Flask REST Backend (Python)                 │
│                                                             │
│  ┌────────────────┐  ┌──────────────────┐  ┌─────────────┐  │
│  │ Flask Routes   │  │  Risk Calculator │  │ Cache System│  │
│  │  (Blueprints)  │  │  (0-100 Score)   │  │ (TTL Store) │  │
│  └───────┬────────┘  └────────┬─────────┘  └──────┬──────┘  │
└──────────┼────────────────────┼───────────────────┼─────────┘
           │                    │                   │
           ▼                    ▼                   ▼
┌──────────────────┐  ┌───────────────────┐  ┌────────────────┐
│ Open-Meteo API   │  │ Featherless AI    │  │ Neon Postgres  │
│ (Weather & Flood)│  │ (LLM Briefing)    │  │ (Optional DB)  │
└──────────────────┘  └───────────────────┘  └────────────────┘
```

---

## 🧰 Technology Stack

| Component | Technology | Purpose |
|---|---|---|
| **Backend Framework** | Python 3.10+ & Flask | REST API endpoints, routing, and server orchestration |
| **Risk Engine** | Python Heuristics Engine | Transparent 0-100 score calculation and factor analysis |
| **Frontend UI** | React.js + Vite | Reactive user dashboard |
| **Interactive Map** | Leaflet.js + React-Leaflet | Dynamic maps, markers, POIs, and risk zones |
| **Weather API** | Open-Meteo Weather API | Live rain intensity, hourly & 7-day forecasts |
| **Flood API** | Open-Meteo Flood (GloFAS) | River discharge rates and 14-day flood models |
| **AI Briefings** | Featherless AI (LLM) | Natural language emergency briefings & guidance |
| **Database** | Neon PostgreSQL (SQLAlchemy) | Persistence for alerts, observations, and saved locations |
| **Charts & Visuals** | Recharts | Hydrograph trend visualizer |

---

## 📁 Repository Directory Structure

```
floodguard/
├── backend/
│   ├── app/
│   │   ├── __init__.py            # Flask App Factory & Blueprint Config
│   │   ├── config.py              # Environment Variables Configuration
│   │   ├── routes/                # Endpoints (weather, flood, risk, alerts, ai, location, route)
│   │   ├── services/               # External APIs (Open-Meteo, Featherless, Geocoding, Cache)
│   │   ├── risk_engine/            # Risk calculator algorithm & physical thresholds
│   │   ├── models/                 # SQLAlchemy Database ORM Models
│   │   └── database/               # Database Connection & Initialization
│   ├── run.py                     # Backend Entry Point Script
│   ├── requirements.txt           # Python Package Dependencies
│   └── .env.example               # Template for Backend Environment Variables
│
├── frontend/
│   ├── src/
│   │   ├── components/            # UI Components (Map, Cards, Charts, LocationSearch)
│   │   ├── pages/                 # Main Views (Dashboard, Map, Risk, Alerts, About)
│   │   ├── services/api.js        # Axios Client Connection
│   │   └── App.jsx                # Application Entry Point
│   ├── package.json
│   └── vite.config.js
│
├── PROJECT_DOCUMENTATION_FOR_TEACHER.md  # Detailed Academic Documentation
└── README.md                              # Main GitHub Documentation
```

---

## ⚡ Quick Start Guide

### Prerequisites
- **Node.js** 18+
- **Python** 3.10+
- **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/Jeet161/floodguard.git
cd floodguard
```

### 2. Backend Setup (Python & Flask)
```bash
cd backend

# Create & activate virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Setup environment file
cp .env.example .env

# Run Flask server
python run.py
```
*Backend runs on `http://localhost:5000`*

### 3. Frontend Setup (React & Vite)
```bash
cd ../frontend

# Install dependencies
npm install

# Run development server
npm run dev
```
*Frontend runs on `http://localhost:5173`*

---

## 🔑 Environment Configuration

### Backend (`backend/.env`)

| Parameter | Required | Description |
|---|---|---|
| `DATABASE_URL` | Optional | Neon PostgreSQL connection string (runs in-memory if omitted) |
| `FEATHERLESS_API_KEY` | Optional | Featherless AI Key (uses rule-based generator if omitted) |
| `FEATHERLESS_MODEL` | Optional | Default: `meta-llama/Meta-Llama-3.1-8B-Instruct` |
| `PORT` | Optional | Backend Server Port (Default: `5000`) |
| `CORS_ORIGINS` | Optional | CORS Whitelist (Default: `http://localhost:5173`) |

---

## 🌐 API Endpoint Matrix

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Backend status & database connectivity check |
| `GET` | `/api/weather` | Fetch precipitation & temperature forecasts for latitude/longitude |
| `GET` | `/api/flood` | Fetch river discharge & GloFAS forecast trends |
| `GET` | `/api/risk` | Retrieve computed 0-100 risk score and contributing factors |
| `GET` | `/api/alerts` | Fetch active risk alerts for location |
| `POST` | `/api/ai/analysis` | Generate LLM-powered safety briefing from structured risk data |
| `GET` | `/api/location/search` | Search locations using OpenStreetMap Nominatim geocoding |
| `POST` | `/api/route/assess` | Compute risk breakdown along route coordinates |

---

## 🛡️ License & Disclaimers

Distributed under the **MIT License**.

> **Note**: FloodGuard is an educational, informational risk-assessment tool. It provides heuristic estimations and does not replace official emergency announcements from government disaster management authorities.
