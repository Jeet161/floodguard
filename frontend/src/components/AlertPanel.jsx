import { RISK_COLORS, RISK_EMOJI } from "../utils/format";
import { ErrorState } from "./RiskCard";

export default function AlertPanel({ alerts, loading, error }) {
  if (loading) return <Skeleton />;
  if (error) return <ErrorState title="Alerts unavailable" message={error} />;
  if (!alerts) return null;

  return (
    <div className="rounded-2xl border border-navy-700 bg-navy-800/60 p-6 shadow-card">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Active Alerts</h3>

      {alerts.length === 0 && (
        <p className="mt-4 text-sm text-slate-400">No alerts for this location right now.</p>
      )}

      <ul className="mt-4 space-y-3">
        {alerts.map((a, i) => (
          <li
            key={i}
            className="rounded-xl border-l-4 bg-navy-700/30 p-4"
            style={{ borderColor: RISK_COLORS[a.severity] || "#64748B" }}
          >
            <div className="flex items-center gap-2">
              <span aria-hidden="true">{RISK_EMOJI[a.severity]}</span>
              <span className="text-sm font-semibold" style={{ color: RISK_COLORS[a.severity] }}>
                {a.severity}
              </span>
              <span className="text-sm font-medium text-slate-200">{a.title}</span>
            </div>
            <p className="mt-1 text-xs text-slate-400">{a.description}</p>
            {a.reason && <p className="mt-1 text-[11px] text-slate-500">Reason: {a.reason}</p>}
            <p className="mt-1 text-[11px] text-slate-600">
              {a.timestamp ? new Date(a.timestamp).toLocaleString() : ""}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="rounded-2xl border border-navy-700 bg-navy-800/60 p-6 shadow-card">
      <div className="skeleton h-4 w-32" />
      <div className="mt-4 space-y-3">
        {[...Array(2)].map((_, i) => <div key={i} className="skeleton h-16" />)}
      </div>
    </div>
  );
}
