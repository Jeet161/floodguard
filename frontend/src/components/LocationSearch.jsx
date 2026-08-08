import { useState, useRef, useEffect } from "react";
import { api } from "../services/api";

export default function LocationSearch({ onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const timeoutRef = useRef(null);
  const boxRef = useRef(null);

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
    if (value.trim().length < 3) {
      setResults([]);
      return;
    }
    timeoutRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await api.searchLocation(value);
        setResults(data);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);
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
        } catch {
          /* keep coordinate fallback */
        }
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
      <div className="flex items-center gap-2 rounded-xl border border-navy-600 bg-navy-800/80 px-4 py-3 shadow-card focus-within:border-water-500">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0 text-slate-400">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
          <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          value={query}
          onChange={handleChange}
          onFocus={() => results.length && setOpen(true)}
          placeholder="Search a city, village, district or location..."
          aria-label="Search for a location"
          className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 outline-none"
        />
        <button
          onClick={useMyLocation}
          aria-label="Use my location"
          className="flex shrink-0 items-center gap-1 rounded-lg bg-water-600/20 px-2.5 py-1.5 text-xs font-medium text-water-400 hover:bg-water-600/30 transition-colors"
        >
          {locating ? "Locating…" : "📍 Use My Location"}
        </button>
      </div>

      {open && (loading || results.length > 0) && (
        <div className="absolute z-[1100] mt-2 w-full overflow-hidden rounded-xl border border-navy-600 bg-navy-800 shadow-card">
          {loading && <div className="px-4 py-3 text-sm text-slate-400">Searching…</div>}
          {!loading &&
            results.map((r, i) => (
              <button
                key={i}
                onClick={() => pick(r)}
                className="block w-full truncate px-4 py-2.5 text-left text-sm text-slate-200 hover:bg-navy-700"
              >
                {r.name}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
