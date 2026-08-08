import { ErrorState } from "./RiskCard";
import { formatNumber } from "../utils/format";

const TREND_LABEL = {
  increasing: { text: "Increasing", color: "text-risk-critical", arrow: "↗" },
  decreasing: { text: "Decreasing", color: "text-risk-low", arrow: "↘" },
  stable: { text: "Stable", color: "text-water-400", arrow: "→" },
  unknown: { text: "Unknown", color: "text-slate-400", arrow: "—" },
};

export default function RiverCard({ flood, loading, error }) {
  if (loading) return <Skeleton />;
  if (error) return <ErrorState title="River data unavailable" message={error} />;
  if (!flood) return null;

  if (!flood.available) {
    return (
      <div className="rounded-2xl border border-navy-700 bg-navy-800/60 p-6 shadow-card">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">River Discharge</h3>
        <p className="mt-4 text-sm text-slate-400">
          {flood.note || "No modeled river reach found near this location. River discharge data is unavailable here."}
        </p>
      </div>
    );
  }

  const trend = TREND_LABEL[flood.trend] || TREND_LABEL.unknown;

  return (
    <div className="rounded-2xl border border-navy-700 bg-navy-800/60 p-6 shadow-card">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">River Discharge</h3>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-3xl font-extrabold tabular-nums">{formatNumber(flood.current_discharge_m3s, 0)}</p>
          <p className="text-xs text-slate-400">m³/s current discharge</p>
        </div>
        <div className={`flex items-center gap-1 text-sm font-semibold ${trend.color}`}>
          <span>{trend.arrow}</span> {trend.text}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-navy-700/40 px-3 py-2.5">
          <p className="text-[11px] text-slate-400">Peak forecast</p>
          <p className="text-sm font-semibold text-slate-100">{formatNumber(flood.peak_forecast_discharge_m3s, 0)} m³/s</p>
        </div>
        <div className="rounded-xl bg-navy-700/40 px-3 py-2.5">
          <p className="text-[11px] text-slate-400">Forecast window</p>
          <p className="text-sm font-semibold text-slate-100">14 days</p>
        </div>
      </div>

      <p className="mt-4 text-[11px] text-slate-500">Source: {flood.source}</p>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="rounded-2xl border border-navy-700 bg-navy-800/60 p-6 shadow-card">
      <div className="skeleton h-4 w-32" />
      <div className="mt-4 skeleton h-12 w-24" />
      <div className="mt-5 grid grid-cols-2 gap-3">
        {[...Array(2)].map((_, i) => <div key={i} className="skeleton h-12" />)}
      </div>
    </div>
  );
}
