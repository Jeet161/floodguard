import { useState, useRef, useEffect } from "react";
import { Search, LocateFixed, Loader2, MapPin } from "lucide-react";
import { api } from "../services/api";

export default function LocationSearch({ onSelect }) {
  const [query, setQuery]     = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const timeoutRef = useRef(null);
  const boxRef     = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleChange(e) {
    const value = e.target.value;
    setQuery(value);
    clearTimeout(timeoutRef.current);
    if (value.trim().length < 3) { setResults([]); return; }
    timeoutRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await api.searchLocation(value);
        setResults(data);
        setOpen(true);
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 380);
  }

  function pick(result) {
    onSelect({ latitude: result.latitude, longitude: result.longitude, name: result.name });
    setQuery(result.name);
    setOpen(false);
  }

  function useMyLocation() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        let name = `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`;
        try {
          const rev = await api.reverseGeocode(latitude, longitude);
          name = rev.name;
        } catch { /* keep coordinate fallback */ }
        onSelect({ latitude, longitude, name });
        setQuery(name);
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 8000 }
    );
  }

  return (
    <div ref={boxRef} className="relative w-full max-w-xl">
      {/* Input row */}
      <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-navy-800/70 px-4 py-3 shadow-lg backdrop-blur-sm transition-all duration-200 focus-within:border-water-500/60 focus-within:shadow-water-500/10 focus-within:shadow-lg">
        {loading
          ? <Loader2 size={16} className="shrink-0 animate-spin text-water-400" strokeWidth={2.5} />
          : <Search size={16} className="shrink-0 text-slate-500" strokeWidth={2} />
        }
        <input
          value={query}
          onChange={handleChange}
          onFocus={() => results.length && setOpen(true)}
          placeholder="Search a city, village, district or location…"
          aria-label="Search for a location"
          className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 outline-none"
        />
        <button
          onClick={useMyLocation}
          aria-label="Use my location"
          disabled={locating}
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-water-500/25 bg-water-500/10 px-3 py-1.5 text-[11px] font-semibold text-water-400 transition-all duration-200 hover:border-water-500/50 hover:bg-water-500/20 disabled:opacity-60"
        >
          {locating
            ? <Loader2 size={12} className="animate-spin" strokeWidth={2.5} />
            : <LocateFixed size={12} strokeWidth={2.5} />
          }
          {locating ? "Locating…" : "Use My Location"}
        </button>
      </div>

      {/* Dropdown results */}
      {open && (loading || results.length > 0) && (
        <div className="absolute z-[1200] mt-2 w-full overflow-hidden rounded-xl border border-white/[0.08] bg-navy-800/95 shadow-2xl backdrop-blur-xl">
          {loading && (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-slate-500">
              <Loader2 size={13} className="animate-spin" strokeWidth={2.5} />
              Searching…
            </div>
          )}
          {!loading && results.map((r, i) => (
            <button
              key={i}
              onClick={() => pick(r)}
              className="flex w-full items-center gap-3 truncate px-4 py-2.5 text-left text-sm text-slate-300 transition-colors duration-150 hover:bg-white/[0.06] hover:text-slate-100"
            >
              <MapPin size={13} className="shrink-0 text-slate-500" strokeWidth={2} />
              {r.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
