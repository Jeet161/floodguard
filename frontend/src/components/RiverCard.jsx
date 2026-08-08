import { TrendingUp, TrendingDown, Minus, Waves } from "lucide-react";
import { ErrorState } from "./RiskCard";
import { formatNumber } from "../utils/format";

const TREND_CONFIG = {
  increasing: { label: "Increasing", Icon: TrendingUp,   color: "#EF4444" },
  decreasing: { label: "Decreasing", Icon: TrendingDown, color: "#2ECC71" },
  stable:     { label: "Stable",     Icon: Minus,        color: "#5EC8F2" },
  unknown:    { label: "Unknown",    Icon: Minus,        color: "#64748B" },
};

export default function RiverCard({ flood, loading, error }) {
  if (loading) return <Skeleton />;
  if (error) return <ErrorState title="River data unavailable" message={error} />;
  if (!flood) return null;

  if (!flood.available) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-navy-900/60 p-6 shadow-card backdrop-blur-sm">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
          River Discharge
        </span>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 py-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800/60">
            <Waves size={22} className="text-slate-500" strokeWidth={1.8} />
          </div>
          <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
            {flood.note || "No modeled river reach found near this location."}
          </p>
        </div>
      </div>
    );
  }

  const trend = TREND_CONFIG[flood.trend] ?? TREND_CONFIG.unknown;
  const { Icon: TrendIcon } = trend;

  // Build a simple % fill bar for visual context
  const peakFill = flood.peak_forecast_discharge_m3s && flood.current_discharge_m3s
    ? Math.min(100, (flood.current_discharge_m3s / flood.peak_forecast_discharge_m3s) * 100)
    : null;

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-navy-900/60 p-6 shadow-card backdrop-blur-sm">
      <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
        River Discharge
      </span>

      {/* Hero value + trend */}
      <div className="mt-4 flex items-end justify-between">
        <div>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-black tabular-nums leading-none text-slate-100">
              {formatNumber(flood.current_discharge_m3s, 0)}
            </p>
            <span className="text-sm font-medium text-slate-500">m³/s</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">current discharge</p>
        </div>

        <div
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
          style={{ background: `${trend.color}18`, color: trend.color }}
        >
          <TrendIcon size={13} strokeWidth={2.5} />
          {trend.label}
        </div>
      </div>

      {/* Fill bar */}
      {peakFill !== null && (
        <div className="mt-4">
          <div className="flex justify-between text-[10px] text-slate-600 mb-1">
            <span>Current vs. forecast peak</span>
            <span>{Math.round(peakFill)}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-navy-700/80">
            <div
              className="h-1.5 rounded-full bg-water-500 transition-all duration-1000"
              style={{ width: `${peakFill}%` }}
            />
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="mt-5 grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-white/[0.04] bg-navy-800/50 px-3 py-2.5">
          <p className="text-[10px] text-slate-500">Peak forecast</p>
          <p className="mt-1 text-sm font-semibold text-slate-200">
            {formatNumber(flood.peak_forecast_discharge_m3s, 0)} m³/s
          </p>
        </div>
        <div className="rounded-xl border border-white/[0.04] bg-navy-800/50 px-3 py-2.5">
          <p className="text-[10px] text-slate-500">Forecast window</p>
          <p className="mt-1 text-sm font-semibold text-slate-200">14 days</p>
        </div>
      </div>

      <p className="mt-4 text-[11px] text-slate-600">Source: {flood.source}</p>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-navy-900/60 p-6 shadow-card">
      <div className="skeleton h-3 w-28" />
      <div className="mt-4 skeleton h-12 w-32" />
      <div className="mt-4 skeleton h-2 w-full rounded-full" />
      <div className="mt-5 grid grid-cols-2 gap-2">
        {[...Array(2)].map((_, i) => <div key={i} className="skeleton h-14" />)}
      </div>
    </div>
  );
}
