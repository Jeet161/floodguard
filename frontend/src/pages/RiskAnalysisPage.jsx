import { useLocation } from "../context/LocationContext";
import { useLocationData } from "../hooks/useLocationData";
import LocationSearch from "../components/LocationSearch";
import RiskCard from "../components/RiskCard";
import ForecastChart from "../components/ForecastChart";
import AIAnalysis from "../components/AIAnalysis";
import WeatherCard from "../components/WeatherCard";
import RiverCard from "../components/RiverCard";

export default function RiskAnalysisPage() {
  const { location, setLocation } = useLocation();
  const { weather, flood, risk, loading, errors, lastUpdated } = useLocationData(location);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Risk Analysis</h1>
          <p className="text-sm text-slate-400">Detailed flood-risk breakdown for a chosen location.</p>
        </div>
        <LocationSearch onSelect={setLocation} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <RiskCard risk={risk} loading={loading.risk} error={errors.risk} lastUpdated={lastUpdated} />
          <ForecastChart
            weather={weather} flood={flood}
            loadingWeather={loading.weather} loadingFlood={loading.flood}
            errorWeather={errors.weather} errorFlood={errors.flood}
          />
        </div>
        <div className="space-y-6">
          <WeatherCard weather={weather} loading={loading.weather} error={errors.weather} />
          <RiverCard flood={flood} loading={loading.flood} error={errors.flood} />
        </div>
      </div>

      <AIAnalysis location={location} weather={weather} flood={flood} risk={risk} />
    </div>
  );
}
