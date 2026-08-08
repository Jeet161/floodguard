export default function MapLegend() {
  const rows = [
    { emoji: "🟢", label: "Low", color: "#2ECC71" },
    { emoji: "🟡", label: "Moderate", color: "#F1C40F" },
    { emoji: "🟠", label: "High", color: "#F39C12" },
    { emoji: "🔴", label: "Critical", color: "#E74C3C" },
  ];
  return (
    <div className="rounded-2xl border border-navy-700 bg-navy-800/60 p-4 shadow-card">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Flood Risk Legend</p>
      <ul className="mt-3 space-y-2">
        {rows.map((r) => (
          <li key={r.label} className="flex items-center gap-2 text-sm">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: r.color }} />
            <span className="text-slate-300">{r.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
