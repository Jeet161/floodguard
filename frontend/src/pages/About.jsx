export default function About() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-bold sm:text-2xl">About &amp; Methodology</h1>
        <p className="mt-2 text-sm text-slate-400">How FloodGuard works, and what its data sources are.</p>
      </div>

      <div className="space-y-4 rounded-2xl border border-navy-700 bg-navy-800/60 p-6 shadow-card">
        <Item title="Map Data" text="OpenStreetMap provides the base geographical map data, including roads, rivers, and important infrastructure." />
        <Item title="Weather Data" text="Open-Meteo Weather API provides real-time and forecast rainfall, temperature, wind and precipitation probability data. No API key required." />
        <Item title="Flood / River Data" text="Open-Meteo Flood API (built on the GloFAS v4 global hydrological model) provides modeled river discharge and forecast trends. Coverage depends on proximity to a modeled river reach." />
        <Item title="Risk Engine" text="Our backend combines rainfall forecasts and river discharge trends into a transparent 0-100 risk score and LOW/MODERATE/HIGH/CRITICAL classification. This is an application-generated heuristic, not a certified hydrological forecast." />
        <Item title="AI Interpretation" text="Featherless AI turns the backend's structured risk data into a plain-language situation summary and general preparedness suggestions. It never invents measurements or official warnings — it only explains numbers we already calculated." />
      </div>

      <div className="rounded-2xl border border-amber-900/40 bg-amber-950/20 p-6 text-sm text-amber-200 shadow-card">
        ⚠ FloodGuard is an informational risk-assessment tool built for demonstration purposes.
        It does not replace official emergency warnings from local authorities. Always follow
        guidance from your local government and emergency services during an actual flood event.
      </div>
    </div>
  );
}

function Item({ title, text }) {
  return (
    <div>
      <p className="text-sm font-semibold text-water-400">{title}</p>
      <p className="mt-1 text-sm text-slate-300">{text}</p>
    </div>
  );
}
