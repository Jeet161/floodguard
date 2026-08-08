import { useLocation } from "../context/LocationContext";
import { useLocationData } from "../hooks/useLocationData";
import LocationSearch from "../components/LocationSearch";
import MetricCards from "../components/MetricCards";
import RiskCard from "../components/RiskCard";
import WeatherCard from "../components/WeatherCard";
import RiverCard from "../components/RiverCard";
import ForecastChart from "../components/ForecastChart";
import AlertPanel from "../components/AlertPanel";
import AIAnalysis from "../components/AIAnalysis";
import FloodMap from "../components/FloodMap";
import { timeAgo } from "../utils/format";
import { MapPin, RefreshCw } from "lucide-react";

export default function Dashboard() {
  const { location, setLocation } = useLocation();
  const { weather, flood, risk, alerts, loading, errors, lastUpdated } = useLocationData(location);

  return (
    <div className="space-y-6">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-gradient-to-br from-navy-900 via-[#0d1628] to-navy-900 p-7 sm:p-10 shadow-card">
        {/* Background glow orbs */}
        <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-water-600/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-water-500/8 blur-3xl" />

        <div className="relative">
          <h1 className="text-3xl font-black tracking-tight text-slate-100 sm:text-5xl">
            Flood<span className="text-water-400">Guard</span>
          </h1>
          <p className="mt-2 max-w-xl text-sm text-slate-400 sm:text-base leading-relaxed">
            Real-time flood intelligence, risk monitoring, and early warnings — powered by live hydro-meteorological data.
          </p>

          <div className="mt-6">
            <LocationSearch onSelect={setLocation} />
          </div>

          {/* Location + update stamp */}
          <div className="mt-3.5 flex items-center gap-2 text-[12px] text-slate-500">
            <MapPin size={12} strokeWidth={2} className="text-water-500/70" />
            <span>
              <span className="font-medium text-slate-300">{location.name}</span>
            </span>
            <span className="text-slate-700">·</span>
            <RefreshCw size={11} strokeWidth={2} className="text-slate-600" />
            <span>{timeAgo(lastUpdated)}</span>
          </div>
        </div>
      </section>

      {/* ── Metric cards ─────────────────────────────────────────────────── */}
      <MetricCards risk={risk} weather={weather} flood={flood} alerts={alerts} loading={loading.risk} />

      {/* ── Map + Risk score ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <FloodMap location={location} risk={risk} />
        </div>
        <RiskCard risk={risk} loading={loading.risk} error={errors.risk} lastUpdated={lastUpdated} />
      </div>

      {/* ── Weather + River ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <WeatherCard weather={weather} loading={loading.weather} error={errors.weather} />
        <RiverCard flood={flood} loading={loading.flood} error={errors.flood} />
      </div>

      {/* ── Forecast chart ────────────────────────────────────────────────── */}
      <ForecastChart
        weather={weather} flood={flood}
        loadingWeather={loading.weather} loadingFlood={loading.flood}
        errorWeather={errors.weather} errorFlood={errors.flood}
      />

      {/* ── Alerts + AI ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AlertPanel alerts={alerts} loading={loading.alerts} error={errors.alerts} />
        <AIAnalysis location={location} weather={weather} flood={flood} risk={risk} />
      </div>
    </div>
  );
}
