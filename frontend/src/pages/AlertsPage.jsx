import { useLocation } from "../context/LocationContext";
import { useLocationData } from "../hooks/useLocationData";
import LocationSearch from "../components/LocationSearch";
import AlertPanel from "../components/AlertPanel";
import { Bell } from "lucide-react";

export default function AlertsPage() {
  const { location, setLocation } = useLocation();
  const { alerts, loading, errors } = useLocationData(location);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-navy-800/70">
            <Bell size={18} className="text-water-400" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-100 sm:text-3xl">
              Alerts
            </h1>
            <p className="text-sm text-slate-500">
              Live flood and weather alerts for this location.
            </p>
          </div>
        </div>
        <LocationSearch onSelect={setLocation} />
      </div>

      <div className="max-w-2xl">
        <AlertPanel alerts={alerts} loading={loading.alerts} error={errors.alerts} />
      </div>
    </div>
  );
}
