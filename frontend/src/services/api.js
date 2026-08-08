import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
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

export const api = {
  health: () => unwrap(client.get("/api/health")),

  getWeather: (lat, lon) => unwrap(client.get("/api/weather", { params: { lat, lon } })),

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
};
