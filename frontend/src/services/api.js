import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
});

function unwrap(promise) {
  return promise
    .then((res) => res.data.data ?? res.data)
    .catch((err) => {
      const message =
        err.response?.data?.error || err.message || "Unexpected network error";
      throw new Error(message);
    });
}

function normalizeOpenMeteoWeather(data) {
  const current = data.current || {};
  const hourly = data.hourly || {};
  const daily = data.daily || {};

  const hourlySeries = [];
  const times = hourly.time || [];
  const precip = hourly.precipitation || [];
  const precipProb = hourly.precipitation_probability || [];
  const temps = hourly.temperature_2m || [];
  const limit = Math.min(48, times.length);
  for (let i = 0; i < limit; i++) {
    hourlySeries.push({
      time: times[i],
      temperature_c: temps[i] ?? null,
      precipitation_mm: precip[i] ?? null,
      precipitation_probability: precipProb[i] ?? null,
    });
  }

  const dailySeries = [];
  const dTimes = daily.time || [];
  const dPrecip = daily.precipitation_sum || [];
  const dPrecipProb = daily.precipitation_probability_max || [];
  const dTmax = daily.temperature_2m_max || [];
  const dTmin = daily.temperature_2m_min || [];
  for (let i = 0; i < dTimes.length; i++) {
    dailySeries.push({
      date: dTimes[i],
      precipitation_sum_mm: dPrecip[i] ?? null,
      precipitation_probability_max: dPrecipProb[i] ?? null,
      temp_max_c: dTmax[i] ?? null,
      temp_min_c: dTmin[i] ?? null,
    });
  }

  const next12h = hourlySeries.slice(0, 12).reduce((sum, h) => sum + (h.precipitation_mm || 0), 0);
  const next24h = hourlySeries.slice(0, 24).reduce((sum, h) => sum + (h.precipitation_mm || 0), 0);

  return {
    current: {
      temperature_c: current.temperature_2m,
      precipitation_mm: current.precipitation,
      rain_mm: current.rain,
      weather_code: current.weather_code,
      wind_speed_kmh: current.wind_speed_10m,
      relative_humidity: current.relative_humidity_2m,
      time: current.time,
    },
    hourly: hourlySeries,
    daily: dailySeries,
    forecast_rain_next_12h_mm: Math.round(next12h * 100) / 100,
    forecast_rain_next_24h_mm: Math.round(next24h * 100) / 100,
    source: "Open-Meteo Weather API (Client-side Fallback)",
    timezone: data.timezone,
  };
}

export const api = {
  health: () => unwrap(client.get("/api/health")),

  getWeather: (lat, lon) =>
    unwrap(client.get("/api/weather", { params: { lat, lon } })).catch((err) => {
      console.warn("Backend weather API rate-limited (HTTP 429). Falling back to direct client call...", err);
      return axios
        .get("https://api.open-meteo.com/v1/forecast", {
          params: {
            latitude: lat,
            longitude: lon,
            current: "temperature_2m,precipitation,rain,weather_code,wind_speed_10m,relative_humidity_2m",
            hourly: "temperature_2m,precipitation,precipitation_probability,rain,weather_code",
            daily: "precipitation_sum,precipitation_probability_max,temperature_2m_max,temperature_2m_min,weather_code",
            forecast_days: 7,
            timezone: "auto",
          },
        })
        .then((res) => normalizeOpenMeteoWeather(res.data));
    }),

  getFlood: (lat, lon) => unwrap(client.get("/api/flood", { params: { lat, lon } })),

  getRisk: (lat, lon, name) =>
    unwrap(client.get("/api/risk", { params: { lat, lon, name } })),

  getAlerts: (lat, lon, name) =>
    unwrap(client.get("/api/alerts", { params: { lat, lon, name } })),

  searchLocation: (q) => unwrap(client.get("/api/location/search", { params: { q } })),

  reverseGeocode: (lat, lon) =>
    unwrap(client.get("/api/location/reverse", { params: { lat, lon } })),

  getImportantLocations: (lat, lon, radius = 5000) =>
    unwrap(client.get("/api/location/important", { params: { lat, lon, radius } })),

  analyzeWithAI: (payload) => unwrap(client.post("/api/ai/analyze", payload)),

  getRoute: (from_lat, from_lng, to_lat, to_lng, risk_lat, risk_lng, risk_score) =>
    unwrap(client.get("/api/route", {
      params: { from_lat, from_lng, to_lat, to_lng, risk_lat, risk_lng, risk_score }
    })),
};
