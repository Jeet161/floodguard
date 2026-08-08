import { useLocation } from "../context/LocationContext";
import { useLocationData } from "../hooks/useLocationData";
import LocationSearch from "../components/LocationSearch";
import FloodMap from "../components/FloodMap";
import MapLegend from "../components/MapLegend";

export default function FloodMapPage() {
  const { location, setLocation } = useLocation();
  const { risk } = useLocationData(location);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Flood Map</h1>
          <p className="text-sm text-slate-400">Explore flood risk, rivers and important locations.</p>
        </div>
        <LocationSearch onSelect={setLocation} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <FloodMap location={location} risk={risk} height="620px" />
        </div>
        <div className="space-y-4">
          <MapLegend />
          <div className="rounded-2xl border border-navy-700 bg-navy-800/60 p-4 text-xs text-slate-400 shadow-card">
            Toggle layers using the control in the top-right of the map to show/hide flood risk zones and
            important locations (hospitals, police, fire stations, shelters).
          </div>
        </div>
      </div>
    </div>
  );
}
