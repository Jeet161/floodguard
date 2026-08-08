import { Thermometer, Wind, Droplets, CloudRain, Sun, Cloud, CloudDrizzle, CloudSnow, Zap } from "lucide-react";
import { ErrorState } from "./RiskCard";
import { formatNumber } from "../utils/format";

function getWeatherIcon(code) {
  if (code === 0) return { Icon: Sun, color: "#FBBF24" };
  if ([1, 2, 3].includes(code)) return { Icon: Cloud, color: "#94A3B8" };
  if ([45, 48].includes(code)) return { Icon: Cloud, color: "#64748B" };
  if ([51, 53, 55, 56, 57].includes(code)) return { Icon: CloudDrizzle, color: "#7DD3FC" };
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { Icon: CloudRain, color: "#2FA8E0" };
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { Icon: CloudSnow, color: "#BAE6FD" };
  if ([95, 96, 99].includes(code)) return { Icon: Zap, color: "#A78BFA" };
  return { Icon: Sun, color: "#FBBF24" };
}

export default function WeatherCard({ weather, loading, error }) {
  if (loading) return <Skeleton />;
  if (error) return <ErrorState title="Weather data unavailable" message={error} />;
  if (!weather) return null;

  const c = weather.current || {};
  const { Icon: WeatherIcon, color: weatherColor } = getWeatherIcon(c.weather_code);

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-navy-900/60 p-6 shadow-card backdrop-blur-sm">
      <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
        Weather
      </span>

      {/* Temp hero row */}
      <div className="mt-4 flex items-center gap-4">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
          style={{ background: `${weatherColor}18` }}
        >
          <WeatherIcon size={28} style={{ color: weatherColor }} strokeWidth={1.8} />
        </div>
        <div>
          <p className="text-4xl font-black tabular-nums leading-none text-slate-100">
            {formatNumber(c.temperature_c, 0)}
            <span className="text-2xl font-bold text-slate-400">°C</span>
          </p>
          <p className="mt-1 text-xs text-slate-500">Current conditions</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="mt-5 grid grid-cols-2 gap-2">
        <StatTile
          label="Precipitation"
          value={`${formatNumber(c.precipitation_mm, 1)} mm/h`}
          Icon={CloudRain}
          color="#2FA8E0"
        />
        <StatTile
          label="Wind"
          value={`${formatNumber(c.wind_speed_kmh, 0)} km/h`}
          Icon={Wind}
          color="#94A3B8"
        />
        <StatTile
          label="Humidity"
          value={`${formatNumber(c.relative_humidity, 0)}%`}
          Icon={Droplets}
          color="#5EC8F2"
        />
        <StatTile
          label="Rain 24h fcst"
          value={`${formatNumber(weather.forecast_rain_next_24h_mm, 0)} mm`}
          Icon={Thermometer}
          color="#7DD3FC"
        />
      </div>

      <p className="mt-4 text-[11px] text-slate-600">Source: Open-Meteo Weather API</p>
    </div>
  );
}

function StatTile({ label, value, Icon, color }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/[0.04] bg-navy-800/50 px-3 py-2.5">
      <span
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
        style={{ background: `${color}18` }}
      >
        <Icon size={13} style={{ color }} strokeWidth={2.5} />
      </span>
      <div>
        <p className="text-[10px] text-slate-500 leading-none">{label}</p>
        <p className="mt-1 text-xs font-semibold text-slate-200 leading-none">{value}</p>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-navy-900/60 p-6 shadow-card">
      <div className="skeleton h-3 w-20" />
      <div className="mt-4 flex items-center gap-4">
        <div className="skeleton h-14 w-14 rounded-2xl" />
        <div className="skeleton h-12 w-28" />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2">
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-14" />)}
      </div>
    </div>
  );
}
