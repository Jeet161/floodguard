import { RISK_COLORS, formatNumber } from "../utils/format";

export default function MetricCards({ risk, weather, flood, alerts, loading }) {
  const items = [
    {
      label: "Flood Risk",
      value: risk ? Math.round(risk.risk_score) : "—",
      sub: risk?.risk_level || "Loading",
      color: risk ? RISK_COLORS[risk.risk_level] : "#64748B",
      icon: "🌊",
    },
    {
      label: "River Discharge",
      value: flood?.available ? `${formatNumber(flood.current_discharge_m3s, 0)}` : "N/A",
      sub: flood?.available ? "m³/s current" : "Unavailable here",
      color: "#5EC8F2",
      icon: "🏞️",
    },
    {
      label: "Rainfall (24h)",
      value: weather ? `${formatNumber(weather.forecast_rain_next_24h_mm, 0)}` : "—",
      sub: "mm forecast",
      color: "#2FA8E0",
      icon: "🌧️",
    },
    {
      label: "Alert Status",
      value: alerts?.length || 0,
      sub: alerts?.length ? `${alerts[0].severity} active` : "No active alerts",
      color: alerts?.length ? RISK_COLORS[alerts[0].severity] : "#2ECC71",
      icon: "🔔",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      {items.map((item, i) => (
        <div key={i} className="rounded-2xl border border-navy-700 bg-navy-800/60 p-4 shadow-card">
          {loading ? (
            <div className="space-y-2">
              <div className="skeleton h-3 w-16" />
              <div className="skeleton h-7 w-12" />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">{item.label}</span>
                <span aria-hidden="true">{item.icon}</span>
              </div>
              <p className="mt-1 text-2xl font-extrabold tabular-nums" style={{ color: item.color }}>{item.value}</p>
              <p className="text-[11px] text-slate-500">{item.sub}</p>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
