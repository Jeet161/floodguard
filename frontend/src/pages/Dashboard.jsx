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

export default function Dashboard() {
  const { location, setLocation } = useLocation();
  const { weather, flood, risk, alerts, loading, errors, lastUpdated } = useLocationData(location);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="rounded-3xl border border-navy-700 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 p-6 sm:p-10 shadow-card">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-4xl">
          Flood<span className="text-water-400">Guard</span>
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400 sm:text-base">
          Real-time flood intelligence, risk monitoring and early warnings.
        </p>
        <div className="mt-6">
          <LocationSearch onSelect={setLocation} />
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Showing data for <span className="font-medium text-slate-300">{location.name}</span> · {timeAgo(lastUpdated)}
        </p>
      </section>

      {/* Metric cards */}
      <MetricCards risk={risk} weather={weather} flood={flood} alerts={alerts} loading={loading.risk} />

      {/* Map + Risk */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <FloodMap location={location} risk={risk} />
        </div>
        <RiskCard risk={risk} loading={loading.risk} error={errors.risk} lastUpdated={lastUpdated} />
      </div>

      {/* Weather + River */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <WeatherCard weather={weather} loading={loading.weather} error={errors.weather} />
        <RiverCard flood={flood} loading={loading.flood} error={errors.flood} />
      </div>

      {/* Forecast */}
      <ForecastChart
        weather={weather} flood={flood}
        loadingWeather={loading.weather} loadingFlood={loading.flood}
        errorWeather={errors.weather} errorFlood={errors.flood}
      />

      {/* Alerts + AI */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AlertPanel alerts={alerts} loading={loading.alerts} error={errors.alerts} />
        <AIAnalysis location={location} weather={weather} flood={flood} risk={risk} />
      </div>
    </div>
  );
}
