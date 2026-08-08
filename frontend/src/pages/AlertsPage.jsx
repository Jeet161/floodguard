import { useLocation } from "../context/LocationContext";
import { useLocationData } from "../hooks/useLocationData";
import LocationSearch from "../components/LocationSearch";
import AlertPanel from "../components/AlertPanel";

export default function AlertsPage() {
  const { location, setLocation } = useLocation();
  const { alerts, loading, errors } = useLocationData(location);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Alerts</h1>
          <p className="text-sm text-slate-400">Backend-generated flood and weather alerts for this location.</p>
        </div>
        <LocationSearch onSelect={setLocation} />
      </div>

      <div className="max-w-2xl">
        <AlertPanel alerts={alerts} loading={loading.alerts} error={errors.alerts} />
      </div>
    </div>
  );
}
