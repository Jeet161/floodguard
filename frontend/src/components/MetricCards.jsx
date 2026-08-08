import { Activity, Waves, CloudRain, BellRing } from "lucide-react";
import { RISK_COLORS, RISK_BG, formatNumber } from "../utils/format";

export default function MetricCards({ risk, weather, flood, alerts, loading }) {
  const items = [
    {
      label: "Flood Risk",
      value: risk ? Math.round(risk.risk_score) : "—",
      sub: risk?.risk_level || "Loading",
      color: risk ? RISK_COLORS[risk.risk_level] : "#64748B",
      bg: risk ? RISK_BG[risk.risk_level] : "rgba(100,116,139,0.1)",
      Icon: Activity,
    },
    {
      label: "River Discharge",
      value: flood?.available ? formatNumber(flood.current_discharge_m3s, 0) : "N/A",
      sub: flood?.available ? "m³/s current" : "No river data",
      color: "#5EC8F2",
      bg: "rgba(94,200,242,0.08)",
      Icon: Waves,
    },
    {
      label: "Rainfall (24h)",
      value: weather ? formatNumber(weather.forecast_rain_next_24h_mm, 0) : "—",
      sub: "mm forecast",
      color: "#2FA8E0",
      bg: "rgba(47,168,224,0.08)",
      Icon: CloudRain,
    },
    {
      label: "Alert Status",
      value: alerts?.length ?? 0,
      sub: alerts?.length ? `${alerts[0].severity} active` : "All clear",
      color: alerts?.length ? RISK_COLORS[alerts[0].severity] : "#2ECC71",
      bg: alerts?.length ? RISK_BG[alerts[0].severity] : "rgba(46,204,113,0.08)",
      Icon: BellRing,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      {items.map((item, i) => (
        <div
          key={i}
          className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-navy-900/60 p-5 shadow-card backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-white/10 hover:shadow-lg"
        >
          {/* Glow bg blob */}
          <div
            className="pointer-events-none absolute -top-6 -right-6 h-20 w-20 rounded-full opacity-40 blur-2xl transition-opacity duration-300 group-hover:opacity-60"
            style={{ background: item.color }}
          />

          {loading ? (
            <div className="space-y-3">
              <div className="skeleton h-3 w-20" />
              <div className="skeleton h-8 w-14" />
              <div className="skeleton h-3 w-16" />
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                  {item.label}
                </span>
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-lg"
                  style={{ background: item.bg }}
                >
                  <item.Icon size={14} style={{ color: item.color }} strokeWidth={2.5} />
                </span>
              </div>
              <p
                className="mt-3 text-3xl font-extrabold tabular-nums leading-none"
                style={{ color: item.color }}
              >
                {item.value}
              </p>
              <p className="mt-1.5 text-[11px] font-medium text-slate-500">{item.sub}</p>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
