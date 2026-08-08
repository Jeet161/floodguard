import { useLocation } from "../context/LocationContext";
import { useLocationData } from "../hooks/useLocationData";
import LocationSearch from "../components/LocationSearch";
import FloodMap from "../components/FloodMap";
import MapLegend from "../components/MapLegend";
import { Layers } from "lucide-react";

export default function FloodMapPage() {
  const { location, setLocation } = useLocation();
  const { risk } = useLocationData(location);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-100 sm:text-3xl">
            Flood Map
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Explore flood risk zones, rivers and critical service locations.
          </p>
        </div>
        <LocationSearch onSelect={setLocation} />
      </div>

      {/* Map + legend sidebar */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <FloodMap location={location} risk={risk} height="640px" />
        </div>

        <div className="space-y-4">
          <MapLegend />

          <div className="rounded-2xl border border-white/[0.06] bg-navy-900/60 p-4 shadow-card backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2.5">
              <Layers size={13} className="text-slate-500" strokeWidth={2} />
              <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                Layer Controls
              </p>
            </div>
            <p className="text-[12px] text-slate-400 leading-relaxed">
              Use the layers control{" "}
              <span className="rounded bg-navy-700 px-1 py-0.5 font-mono text-[10px] text-slate-300">⊞</span>{" "}
              in the top-right of the map to toggle flood risk zones and critical locations (hospitals, police, fire stations, shelters).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
