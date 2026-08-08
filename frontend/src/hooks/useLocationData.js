import { useState, useEffect, useCallback } from "react";
import { api } from "../services/api";

/**
 * Central hook that fetches weather, flood, risk and alerts for a
 * given coordinate + name, tracking independent loading/error state
 * per data source so the UI can degrade gracefully.
 */
export function useLocationData(location) {
  const [weather, setWeather] = useState(null);
  const [flood, setFlood] = useState(null);
  const [risk, setRisk] = useState(null);
  const [alerts, setAlerts] = useState(null);

  const [loading, setLoading] = useState({ weather: false, flood: false, risk: false, alerts: false });
  const [errors, setErrors] = useState({ weather: null, flood: null, risk: null, alerts: null });
  const [lastUpdated, setLastUpdated] = useState(null);

  const refresh = useCallback(() => {
    if (!location) return;
    const { latitude: lat, longitude: lon, name } = location;

    setLoading({ weather: true, flood: true, risk: true, alerts: true });
    setErrors({ weather: null, flood: null, risk: null, alerts: null });

    api.getWeather(lat, lon)
      .then((d) => setWeather(d))
      .catch((e) => setErrors((p) => ({ ...p, weather: e.message })))
      .finally(() => setLoading((p) => ({ ...p, weather: false })));

    api.getFlood(lat, lon)
      .then((d) => setFlood(d))
      .catch((e) => setErrors((p) => ({ ...p, flood: e.message })))
      .finally(() => setLoading((p) => ({ ...p, flood: false })));

    api.getRisk(lat, lon, name)
      .then((d) => setRisk(d))
      .catch((e) => setErrors((p) => ({ ...p, risk: e.message })))
      .finally(() => setLoading((p) => ({ ...p, risk: false })));

    api.getAlerts(lat, lon, name)
      .then((d) => setAlerts(d))
      .catch((e) => setErrors((p) => ({ ...p, alerts: e.message })))
      .finally(() => setLoading((p) => ({ ...p, alerts: false })));

    setLastUpdated(new Date());
  }, [location]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { weather, flood, risk, alerts, loading, errors, lastUpdated, refresh };
}
