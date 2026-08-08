const MAP_STYLES = [
  { label: "Dark",      desc: "Default — high contrast dark tiles" },
  { label: "Light",     desc: "Clean minimal street map" },
  { label: "Satellite", desc: "Esri satellite imagery" },
];

export default function MapLegend() {
  const rows = [
    { label: "Low",      color: "#2ECC71" },
    { label: "Moderate", color: "#F1C40F" },
    { label: "High",     color: "#F97316" },
    { label: "Critical", color: "#EF4444" },
  ];

  return (
    <div className="space-y-3">
      {/* Risk legend */}
      <div className="rounded-2xl border border-white/[0.06] bg-navy-900/60 p-4 shadow-card backdrop-blur-sm">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
          Flood Risk Legend
        </p>
        <ul className="mt-3 space-y-2.5">
          {rows.map((r) => (
            <li key={r.label} className="flex items-center gap-2.5">
              <span
                className="relative flex h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: r.color }}
              >
                <span
                  className="absolute inset-0 rounded-full opacity-40 blur-sm"
                  style={{ backgroundColor: r.color }}
                />
              </span>
              <span className="text-[13px] font-medium text-slate-300">{r.label}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Map style legend */}
      <div className="rounded-2xl border border-white/[0.06] bg-navy-900/60 p-4 shadow-card backdrop-blur-sm">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
          Map Styles
        </p>
        <ul className="mt-3 space-y-2">
          {MAP_STYLES.map((s) => (
            <li key={s.label} className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-water-500/60" />
              <div>
                <span className="text-[12px] font-semibold text-slate-300">{s.label}</span>
                <span className="ml-1.5 text-[11px] text-slate-500">{s.desc}</span>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[10px] text-slate-600 leading-relaxed">
          Switch styles via the <span className="rounded bg-navy-700 px-1 font-mono text-slate-400">⊞</span> control on the map.
        </p>
      </div>
    </div>
  );
}
