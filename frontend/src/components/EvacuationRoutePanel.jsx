import { useState, useRef, useEffect } from "react";
import { Navigation, MapPin, Loader2, Compass, LocateFixed } from "lucide-react";
import { api } from "../services/api";

export default function EvacuationRoutePanel({ origin: defaultOrigin, risk, onRouteUpdate, onClear }) {
  // Origin State
  const [origQuery, setOrigQuery] = useState(defaultOrigin?.name || "");
  const [origCoords, setOrigCoords] = useState(
    defaultOrigin
      ? { lat: defaultOrigin.latitude, lng: defaultOrigin.longitude, name: defaultOrigin.name }
      : null
  );
  const [origResults, setOrigResults] = useState([]);
  const [origOpen, setOrigOpen] = useState(false);
  const [loadingOrigSearch, setLoadingOrigSearch] = useState(false);
  const [locating, setLocating] = useState(false);

  // Destination State
  const [destQuery, setDestQuery] = useState("");
  const [destCoords, setDestCoords] = useState(null);
  const [destResults, setDestResults] = useState([]);
  const [destOpen, setDestOpen] = useState(false);
  const [loadingDestSearch, setLoadingDestSearch] = useState(false);

  // Routing State
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [routeData, setRouteData] = useState(null);
  const [error, setError] = useState(null);

  const searchTimeoutRef = useRef(null);
  const origBoxRef = useRef(null);
  const destBoxRef = useRef(null);

  // Sync with default location if it changes and user hasn't modified it
  useEffect(() => {
    if (defaultOrigin && !origCoords) {
      setOrigQuery(defaultOrigin.name);
      setOrigCoords({ lat: defaultOrigin.latitude, lng: defaultOrigin.longitude, name: defaultOrigin.name });
    }
  }, [defaultOrigin]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (origBoxRef.current && !origBoxRef.current.contains(e.target)) setOrigOpen(false);
      if (destBoxRef.current && !destBoxRef.current.contains(e.target)) setDestOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSearch(value, type) {
    if (type === "origin") {
      setOrigQuery(value);
      setOrigCoords(null);
    } else {
      setDestQuery(value);
      setDestCoords(null);
    }
    
    clearTimeout(searchTimeoutRef.current);
    if (value.trim().length < 3) {
      if (type === "origin") setOrigResults([]);
      else setDestResults([]);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      if (type === "origin") setLoadingOrigSearch(true);
      else setLoadingDestSearch(true);

      try {
        const data = await api.searchLocation(value);
        if (type === "origin") {
          setOrigResults(data);
          setOrigOpen(true);
        } else {
          setDestResults(data);
          setDestOpen(true);
        }
      } catch {
        if (type === "origin") setOrigResults([]);
        else setDestResults([]);
      } finally {
        setLoadingOrigSearch(false);
        setLoadingDestSearch(false);
      }
    }, 400);
  }

  function pickOrigin(result) {
    setOrigQuery(result.name);
    setOrigCoords({ lat: result.latitude, lng: result.longitude, name: result.name });
    setOrigOpen(false);
    setError(null);
  }

  function pickDestination(result) {
    setDestQuery(result.name);
    setDestCoords({ lat: result.latitude, lng: result.longitude, name: result.name });
    setDestOpen(false);
    setError(null);
  }

  function useLiveLocation() {
    if (!navigator.geolocation) return;
    setLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        let name = `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`;
        try {
          const rev = await api.reverseGeocode(latitude, longitude);
          name = rev.name;
        } catch { /* coordinate fallback */ }
        setOrigQuery(name);
        setOrigCoords({ lat: latitude, lng: longitude, name });
        setLocating(false);
      },
      () => {
        setError("Unable to retrieve GPS coordinates");
        setLocating(false);
      },
      { timeout: 8000 }
    );
  }

  async function calculateRoutes() {
    if (!origCoords || !destCoords) return;
    setLoadingRoute(true);
    setError(null);
    try {
      const data = await api.getRoute(
        origCoords.lat,
        origCoords.lng,
        destCoords.lat,
        destCoords.lng,
        origCoords.lat,
        origCoords.lng,
        risk?.risk_score ?? 0
      );
      setRouteData(data);
      onRouteUpdate({
        shortest: data.shortest,
        floodSafe: data.flood_safe,
        bypassed: data.bypassed,
        origin: origCoords,
        destination: destCoords
      });
    } catch (err) {
      setError(err.message || "Failed to calculate route");
      setRouteData(null);
    } finally {
      setLoadingRoute(false);
    }
  }

  function formatDist(m) {
    if (!m) return "—";
    return `${(m / 1000).toFixed(1)} km`;
  }

  function formatDuration(s) {
    if (!s) return "—";
    const mins = Math.round(s / 60);
    if (mins < 60) return `${mins} min`;
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hrs}h ${remMins}m`;
  }

  function handleClear() {
    setOrigQuery("");
    setOrigCoords(null);
    setDestQuery("");
    setDestCoords(null);
    setRouteData(null);
    setError(null);
    onClear();
  }

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-navy-900/60 p-4 shadow-card backdrop-blur-sm space-y-4">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-water-500/15">
          <Navigation size={14} className="text-water-400" strokeWidth={2.5} />
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
          Evacuation Routing
        </span>
      </div>

      {/* Origin Input */}
      <div ref={origBoxRef} className="relative">
        <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">From</label>
        <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-navy-800/50 px-3.5 py-2.5 transition-all duration-200 focus-within:border-water-500/50">
          <MapPin size={14} className="text-slate-500 shrink-0" />
          <input
            value={origQuery}
            onChange={(e) => handleSearch(e.target.value, "origin")}
            onFocus={() => origResults.length && setOrigOpen(true)}
            placeholder="Starting location..."
            className="w-full bg-transparent text-xs text-slate-100 placeholder:text-slate-500 outline-none"
          />
          {loadingOrigSearch && <Loader2 size={12} className="animate-spin text-water-400 shrink-0" />}
          <button
            onClick={useLiveLocation}
            disabled={locating}
            title="Use live GPS location"
            className="text-water-400 hover:text-water-300 disabled:opacity-50 shrink-0 pl-1"
          >
            {locating ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <LocateFixed size={13} strokeWidth={2.5} />
            )}
          </button>
        </div>

        {origOpen && origResults.length > 0 && (
          <div className="absolute z-[1200] mt-1.5 w-full overflow-hidden rounded-xl border border-white/[0.08] bg-navy-800 shadow-2xl backdrop-blur-xl">
            {origResults.map((r, i) => (
              <button
                key={i}
                onClick={() => pickOrigin(r)}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs text-slate-300 hover:bg-white/[0.06]"
              >
                <MapPin size={11} className="text-slate-500" />
                <span className="truncate">{r.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Destination Input */}
      <div ref={destBoxRef} className="relative">
        <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">To</label>
        <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-navy-800/50 px-3.5 py-2.5 transition-all duration-200 focus-within:border-water-500/50">
          <MapPin size={14} className="text-slate-500 shrink-0" />
          <input
            value={destQuery}
            onChange={(e) => handleSearch(e.target.value, "destination")}
            onFocus={() => destResults.length && setDestOpen(true)}
            placeholder="Destination location..."
            className="w-full bg-transparent text-xs text-slate-100 placeholder:text-slate-500 outline-none"
          />
          {loadingDestSearch && <Loader2 size={12} className="animate-spin text-water-400 shrink-0" />}
        </div>

        {destOpen && destResults.length > 0 && (
          <div className="absolute z-[1200] mt-1.5 w-full overflow-hidden rounded-xl border border-white/[0.08] bg-navy-800 shadow-2xl backdrop-blur-xl">
            {destResults.map((r, i) => (
              <button
                key={i}
                onClick={() => pickDestination(r)}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs text-slate-300 hover:bg-white/[0.06]"
              >
                <MapPin size={11} className="text-slate-500" />
                <span className="truncate">{r.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={calculateRoutes}
          disabled={loadingRoute || !origCoords || !destCoords}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-water-600 px-3 py-2 text-xs font-semibold text-white shadow-md shadow-water-600/25 transition-all hover:bg-water-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loadingRoute ? (
            <>
              <Loader2 size={12} className="animate-spin" strokeWidth={2.5} />
              Calculating...
            </>
          ) : (
            <>
              <Compass size={12} strokeWidth={2.5} />
              Find Route
            </>
          )}
        </button>
        {(origCoords || destCoords || routeData) && (
          <button
            onClick={handleClear}
            className="rounded-xl border border-white/[0.06] bg-navy-850 px-3 py-2 text-xs font-semibold text-slate-400 hover:bg-navy-800 hover:text-slate-200"
          >
            Clear
          </button>
        )}
      </div>

      {error && (
        <p className="rounded-lg bg-red-950/20 px-3 py-2 text-[11px] text-red-400">
          {error}
        </p>
      )}

      {/* Route Info Cards */}
      {routeData && (
        <div className="space-y-3 pt-2 border-t border-white/[0.04]">
          {/* Shortest Route */}
          <div className="rounded-xl border border-white/[0.04] bg-navy-800/30 p-3">
            <div className="flex items-center gap-2 text-slate-400">
              <span className="h-1.5 w-3 rounded-full bg-blue-500 border border-dashed border-blue-300 shrink-0" />
              <p className="text-[11px] font-semibold uppercase tracking-wider">Shortest Path</p>
            </div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <p className="text-base font-extrabold text-slate-200">
                {formatDuration(routeData.shortest.duration_s)}
              </p>
              <p className="text-xs text-slate-500">
                {formatDist(routeData.shortest.distance_m)}
              </p>
            </div>
          </div>

          {/* Flood Safe Route */}
          <div className="rounded-xl border border-water-500/10 bg-water-500/5 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-water-400">
                <span className="h-1.5 w-3 rounded-full bg-emerald-500 shrink-0" />
                <p className="text-[11px] font-semibold uppercase tracking-wider">Flood-Safe Path</p>
              </div>
              {routeData.bypassed ? (
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-bold text-emerald-400">
                  Recommended
                </span>
              ) : (
                <span className="rounded-full bg-slate-500/15 px-2 py-0.5 text-[9px] font-bold text-slate-400">
                  Direct Clear
                </span>
              )}
            </div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <p className="text-base font-extrabold text-slate-200">
                {formatDuration(routeData.flood_safe.duration_s)}
              </p>
              <p className="text-xs text-slate-500">
                {formatDist(routeData.flood_safe.distance_m)}
              </p>
            </div>
            <p className="mt-1 text-[10px] text-slate-500 leading-snug">
              {routeData.bypassed
                ? "Bypasses the current flood risk circle."
                : "No active hazard detected on direct route."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
