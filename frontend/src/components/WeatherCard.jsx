import { ErrorState } from "./RiskCard";
import { formatNumber } from "../utils/format";

const WEATHER_ICON = (code) => {
  if (code === 0) return "☀️";
  if ([1, 2, 3].includes(code)) return "⛅";
  if ([45, 48].includes(code)) return "🌫️";
  if ([51, 53, 55, 56, 57].includes(code)) return "🌦️";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "🌧️";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "🌨️";
  if ([95, 96, 99].includes(code)) return "⛈️";
  return "🌤️";
};

export default function WeatherCard({ weather, loading, error }) {
  if (loading) return <Skeleton />;
  if (error) return <ErrorState title="Weather data unavailable" message={error} />;
  if (!weather) return null;

  const c = weather.current || {};

  return (
    <div className="rounded-2xl border border-navy-700 bg-navy-800/60 p-6 shadow-card">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Weather</h3>

      <div className="mt-4 flex items-center gap-4">
        <span className="text-4xl">{WEATHER_ICON(c.weather_code)}</span>
        <div>
          <p className="text-3xl font-extrabold tabular-nums">{formatNumber(c.temperature_c, 0)}°C</p>
          <p className="text-xs text-slate-400">Feels like current conditions</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Metric label="Precipitation" value={`${formatNumber(c.precipitation_mm, 1)} mm/h`} />
        <Metric label="Wind Speed" value={`${formatNumber(c.wind_speed_kmh, 0)} km/h`} />
        <Metric label="Humidity" value={`${formatNumber(c.relative_humidity, 0)}%`} />
        <Metric label="Rain (24h fcst)" value={`${formatNumber(weather.forecast_rain_next_24h_mm, 0)} mm`} />
      </div>

      <p className="mt-4 text-[11px] text-slate-500">Source: Open-Meteo Weather API</p>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-xl bg-navy-700/40 px-3 py-2.5">
      <p className="text-[11px] text-slate-400">{label}</p>
      <p className="text-sm font-semibold text-slate-100">{value}</p>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="rounded-2xl border border-navy-700 bg-navy-800/60 p-6 shadow-card">
      <div className="skeleton h-4 w-24" />
      <div className="mt-4 skeleton h-12 w-32" />
      <div className="mt-5 grid grid-cols-2 gap-3">
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-12" />)}
      </div>
    </div>
  );
}
