import { CheckCircle, AlertTriangle, AlertOctagon, ShieldAlert, Clock } from "lucide-react";
import { RISK_COLORS, RISK_BG } from "../utils/format";
import { ErrorState } from "./RiskCard";

const SEVERITY_ICONS = {
  LOW:      CheckCircle,
  MODERATE: AlertTriangle,
  HIGH:     AlertTriangle,
  CRITICAL: AlertOctagon,
};

export default function AlertPanel({ alerts, loading, error }) {
  if (loading) return <Skeleton />;
  if (error)   return <ErrorState title="Alerts unavailable" message={error} />;
  if (!alerts) return null;

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-navy-900/60 p-6 shadow-card backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
          Active Alerts
        </span>
        {alerts.length > 0 && (
          <span className="rounded-full bg-risk-critical/15 px-2 py-0.5 text-[10px] font-bold text-risk-critical">
            {alerts.length} active
          </span>
        )}
      </div>

      {alerts.length === 0 && (
        <div className="mt-6 flex flex-col items-center gap-3 py-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-risk-low/10">
            <CheckCircle size={22} className="text-risk-low" strokeWidth={2} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-300">All Clear</p>
            <p className="mt-0.5 text-xs text-slate-500">No flood alerts for this location right now.</p>
          </div>
        </div>
      )}

      <ul className="mt-4 space-y-3">
        {alerts.map((a, i) => {
          const color = RISK_COLORS[a.severity] ?? "#64748B";
          const bg    = RISK_BG[a.severity]    ?? "rgba(100,116,139,0.08)";
          const Icon  = SEVERITY_ICONS[a.severity] ?? ShieldAlert;

          return (
            <li
              key={i}
              className="relative overflow-hidden rounded-xl border border-white/[0.04] p-4"
              style={{ background: bg }}
            >
              {/* Left accent bar */}
              <div className="absolute inset-y-0 left-0 w-1 rounded-l-xl" style={{ background: color }} />

              <div className="pl-3">
                {/* Title row */}
                <div className="flex items-center gap-2">
                  <Icon size={14} style={{ color }} strokeWidth={2.5} className="shrink-0" />
                  <span className="text-[11px] font-bold tracking-wider" style={{ color }}>
                    {a.severity}
                  </span>
                  <span className="text-sm font-semibold text-slate-200">{a.title}</span>
                </div>

                {/* Description */}
                <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{a.description}</p>

                {/* Reason + timestamp */}
                {a.reason && (
                  <p className="mt-1 text-[11px] text-slate-500">
                    <span className="font-medium text-slate-500">Reason:</span> {a.reason}
                  </p>
                )}
                {a.timestamp && (
                  <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-600">
                    <Clock size={10} strokeWidth={2} />
                    {new Date(a.timestamp).toLocaleString()}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-navy-900/60 p-6 shadow-card">
      <div className="skeleton h-3 w-28" />
      <div className="mt-4 space-y-3">
        {[...Array(2)].map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}
      </div>
    </div>
  );
}
