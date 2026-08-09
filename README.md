# 🌊 FloodGuard — Flood Control & Early Warning Platform

Real-time flood intelligence, risk monitoring and early warnings, built for hackathon demonstration.

FloodGuard combines OpenStreetMap geography, Open-Meteo weather + flood (GloFAS) data, a transparent
Python risk-scoring engine, and Featherless AI natural-language interpretation into one dashboard.

---

## ✨ Features

- **Interactive flood map** (Leaflet + OpenStreetMap) with risk zones, important locations
  (hospitals, police, fire stations, shelters via Overpass API), and layer toggles.
- **Flood Risk Engine** — a transparent, explainable 0–100 risk score (LOW / MODERATE / HIGH /
  CRITICAL) computed from rainfall forecasts and river-discharge trend data. Never fakes data.
- **Live weather panel** — current conditions + 7-day forecast from Open-Meteo.
- **River discharge panel** — current, trend, and 14-day forecast discharge from the Open-Meteo
  Flood API (GloFAS v4 model).
- **Forecast charts** — rainfall (24h) and river discharge (14d), built with Recharts.
- **Alerts** — backend rule-generated alerts (critical risk, heavy rainfall, rising discharge).
- **AI Situation Analysis** — Featherless AI explains the backend-calculated data in plain language
  and suggests general preparedness actions. The AI never invents measurements or official warnings —
  it only ever explains numbers the backend already computed. If no API key is configured, a
  rule-based fallback summary is used instead so the feature never breaks the app.
- **Location search** with OpenStreetMap/Nominatim geocoding + "Use My Location" geolocation.
- **Full responsive design** — desktop, tablet, and real mobile layouts (not just shrunk desktop).
- **Loading, empty, and error states everywhere** — no frozen UI, no fake data when a source fails.
- **No authentication** — opens straight to the dashboard.

---

## 🏗️ Architecture

```
React (Vite) frontend  ──HTTP──►  Flask backend  ──►  Open-Meteo Weather API
        │                              │           ──►  Open-Meteo Flood API (GloFAS)
        │                              │           ──►  OpenStreetMap Nominatim (geocoding)
        │                              │           ──►  Overpass API (important locations)
        │                              │           ──►  Featherless AI (chat completions)
        │                              │           ──►  Neon PostgreSQL (persistence)
        └── Leaflet map, charts, cards
```

All secret API calls (Featherless AI key, database credentials) happen **only** in the Flask
backend. No secrets are ever placed in frontend code.

---

## 🧰 Technology Stack

| Part | Technology | Purpose |
|---|---|---|
| Frontend | React.js + Vite | UI/dashboard |
| Interactive Map | Leaflet.js + React-Leaflet | Flood map, markers, risk zones |
| Map Data | OpenStreetMap | Roads, rivers, geography |
| Backend | Python + Flask | REST API, application logic |
| Weather | Open-Meteo Weather API | Rainfall & weather forecasts |
| Flood Data | Open-Meteo Flood API / GloFAS | River discharge & flood forecasting |
| AI | Featherless AI | AI situation analysis & recommendations |
| Database | Neon PostgreSQL | Alerts, locations, historical risk data |
| Charts | Recharts | Data visualization |
| Data Processing | Pandas + NumPy | Backend data handling |

---

## 📁 Folder Structure

```
floodguard/
├── backend/
│   ├── app/
│   │   ├── __init__.py            # Flask app factory
│   │   ├── config.py              # env-based configuration
│   │   ├── routes/                # weather, flood, risk, alerts, ai, location, health
│   │   ├── services/               # openmeteo_weather, openmeteo_flood, geocoding, featherless, cache
│   │   ├── risk_engine/            # calculator, thresholds, scoring
│   │   ├── models/                 # SQLAlchemy models: location, alert, observation
│   │   └── database/connection.py  # Neon Postgres connection (works even if unset)
│   ├── run.py
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/  # Navbar, FloodMap, RiskCard, WeatherCard, RiverCard,
│   │   │                # ForecastChart, AlertPanel, AIAnalysis, LocationSearch, MetricCards, MapLegend
│   │   ├── pages/        # Dashboard, FloodMapPage, RiskAnalysisPage, AlertsPage, About
│   │   ├── context/       # LocationContext (shared selected location)
│   │   ├── hooks/          # useLocationData (fetch orchestration)
│   │   ├── services/api.js # Axios client
│   │   ├── utils/format.js
│   │   └── App.jsx
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env.example
│
└── README.md
```

---

## 🚀 Installation & Running

### 0. Clone the Repository

```bash
git clone https://github.com/Jeet161/floodguard.git
cd floodguard
```

### Prerequisites
- Node.js 18+
- Python 3.10+
- (Optional) A Neon PostgreSQL database — the app runs fine without one, just without persistence.
- (Optional) A Featherless AI API key — without one, AI Analysis uses a rule-based fallback.

### 1. Backend (Flask)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # then fill in DATABASE_URL / FEATHERLESS_API_KEY if you have them
python run.py
```

The API runs at `http://localhost:5000`.

### 2. Frontend (React + Vite)

```bash
cd frontend
npm install
cp .env.example .env            # VITE_API_BASE_URL=http://localhost:5000
npm run dev
```

The app runs at `http://localhost:5173` and proxies `/api/*` calls to the Flask backend
(see `vite.config.js`) — or talks to `VITE_API_BASE_URL` directly if set.

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | No | Neon PostgreSQL connection string. If empty, the app runs without persistence. |
| `FEATHERLESS_API_KEY` | No | Featherless AI key. If empty, AI analysis falls back to a rule-based summary. |
| `FEATHERLESS_MODEL` | No | Model name, default `meta-llama/Meta-Llama-3.1-8B-Instruct`. |
| `FEATHERLESS_BASE_URL` | No | Default `https://api.featherless.ai/v1`. |
| `CORS_ORIGINS` | No | Comma-separated allowed origins, default `http://localhost:5173`. |
| `PORT` | No | Default `5000`. |

### Frontend (`frontend/.env`)

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Base URL of the Flask backend, e.g. `http://localhost:5000`. |

---

## 🗄️ Database Setup (Neon PostgreSQL)

1. Create a free project at [neon.tech](https://neon.tech).
2. Copy the connection string (starts with `postgresql://...`) into `DATABASE_URL` in `backend/.env`.
3. Start the backend — `init_db()` automatically creates the tables (`locations`, `alerts`,
   `risk_assessments`, `weather_observations`, `flood_observations`) on first run via SQLAlchemy.

No manual migrations are needed for the hackathon scope.

---

## 🤖 Featherless AI Configuration

1. Get an API key from [featherless.ai](https://featherless.ai).
2. Set `FEATHERLESS_API_KEY` (and optionally `FEATHERLESS_MODEL`) in `backend/.env`.
3. The backend sends **only structured, already-calculated risk data** to the model — it is
   instructed never to invent measurements, evacuation orders, or official warnings, and always to
   frame output as "AI-assisted interpretation."

---

## 🌦️ Open-Meteo Configuration

No API key required for either endpoint:
- Weather: `https://api.open-meteo.com/v1/forecast`
- Flood (GloFAS): `https://flood-api.open-meteo.com/v1/flood`

Both are free for non-commercial use; the backend caches responses for 10 minutes per coordinate
to stay well within rate limits.

---

## 🩺 Troubleshooting

| Symptom | Fix |
|---|---|
| `Failed to fetch` in the browser | Confirm the Flask backend is running on port 5000 and `CORS_ORIGINS` includes your frontend origin. |
| Risk score shows "partial data" warning | One of weather/flood upstream APIs is temporarily unreachable — this is expected graceful degradation, not a bug. |
| River panel says "unavailable" | Some coordinates aren't on a GloFAS-modeled river reach — this is a real data limitation, not an error. |
| AI Analysis uses fallback text | `FEATHERLESS_API_KEY` isn't set, or the Featherless request failed — check backend logs. |
| Map tiles don't load | Check your network can reach `basemaps.cartocdn.com` / `tile.openstreetmap.org`. |
| Database features silently skipped | `DATABASE_URL` isn't set — this is intentional graceful degradation, not an error. |

---

## 🎤 Hackathon Demo Flow

1. Open the dashboard — it loads with a default location and immediately shows risk score, weather,
   river discharge, and alerts.
2. Use the location search (or "Use My Location") to switch to a flood-prone region.
3. Point out the **Flood Risk Score** circular gauge and its listed contributing factors.
4. Open the **Flood Map** tab — toggle the risk-zone and important-locations layers.
5. Click **Generate Analysis** on the AI panel to show Featherless AI explaining the exact same
   numbers already shown on-screen, with a clear "AI-assisted interpretation" disclaimer.
6. Show the **Alerts** tab and the **About/Methodology** page to reinforce credibility and
   transparency about data sources and limitations.

---

## ⚠️ Important Notes

- FloodGuard is an **informational risk-assessment tool** — it does not replace official emergency
  warnings from local authorities.
- The risk score is an application-generated heuristic (see `backend/app/risk_engine/`), not a
  certified hydrological forecast.
- No real data is ever faked. If a source is unavailable, the UI says so explicitly.

