import { useState } from "react";
import { useLocation } from "../context/LocationContext";
import { useLocationData } from "../hooks/useLocationData";
import LocationSearch from "../components/LocationSearch";
import FloodMap from "../components/FloodMap";
import EvacuationRoutePanel from "../components/EvacuationRoutePanel";
import MapLegend from "../components/MapLegend";
import { Navigation } from "lucide-react";

export default function RoutePage() {
  const { location, setLocation } = useLocation();
  const { risk } = useLocationData(location);
  const [routes, setRoutes] = useState(null);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-navy-800/70">
            <Navigation size={18} className="text-water-400" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-100 sm:text-3xl">
              Route Planner
            </h1>
            <p className="text-sm text-slate-500">
              Calculate safe evacuation routes avoiding active flood zones.
            </p>
          </div>
        </div>
        <LocationSearch onSelect={setLocation} />
      </div>

      {/* Main 2-column layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Routing controller sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <EvacuationRoutePanel
            origin={location}
            risk={risk}
            onRouteUpdate={setRoutes}
            onClear={() => setRoutes(null)}
          />
          <MapLegend />
        </div>

        {/* Large map display */}
        <div className="lg:col-span-3">
          <FloodMap location={location} risk={risk} routes={routes} height="620px" />
        </div>
      </div>
    </div>
  );
}
