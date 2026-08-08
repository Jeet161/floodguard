import { RISK_COLORS, RISK_EMOJI, timeAgo } from "../utils/format";

export default function RiskCard({ risk, loading, error, lastUpdated }) {
  if (loading) return <RiskCardSkeleton />;
  if (error) return <ErrorState title="Risk score unavailable" message={error} />;
  if (!risk) return null;

  const color = RISK_COLORS[risk.risk_level] || RISK_COLORS.LOW;
  const score = risk.risk_score ?? 0;
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="rounded-2xl border border-navy-700 bg-navy-800/60 p-6 shadow-card">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Flood Risk Score</h3>
        <span className="text-xs text-slate-500">{timeAgo(lastUpdated)}</span>
      </div>

      <div className="mt-4 flex flex-col items-center sm:flex-row sm:items-center sm:gap-8">
        <div className="relative h-40 w-40 shrink-0">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
            <circle cx="60" cy="60" r="54" fill="none" stroke="#1F2A3F" strokeWidth="10" />
            <circle
              cx="60" cy="60" r="54" fill="none"
              stroke={color} strokeWidth="10" strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: "stroke-dashoffset 1s ease-out" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-extrabold tabular-nums" style={{ color }}>{Math.round(score)}</span>
            <span className="text-[11px] text-slate-500">/ 100</span>
          </div>
        </div>

        <div className="mt-4 flex-1 sm:mt-0">
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-bold" style={{ backgroundColor: `${color}22`, color }}>
            <span aria-hidden="true">{RISK_EMOJI[risk.risk_level]}</span>
            <span>{risk.risk_level} RISK</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Confidence: {Math.round((risk.confidence || 0) * 100)}% · Application-generated estimate
          </p>

          <ul className="mt-3 space-y-1.5">
            {risk.factors?.slice(0, 4).map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-water-500" />
                {f}
              </li>
            ))}
          </ul>

          {risk.partial_data && (
            <p className="mt-3 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
              ⚠ Score calculated with partial data — some sources were unavailable.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function RiskCardSkeleton() {
  return (
    <div className="rounded-2xl border border-navy-700 bg-navy-800/60 p-6 shadow-card">
      <div className="skeleton h-4 w-40" />
      <div className="mt-6 flex items-center gap-8">
        <div className="skeleton h-40 w-40 rounded-full" />
        <div className="flex-1 space-y-3">
          <div className="skeleton h-6 w-32" />
          <div className="skeleton h-3 w-full" />
          <div className="skeleton h-3 w-4/5" />
          <div className="skeleton h-3 w-3/5" />
        </div>
      </div>
    </div>
  );
}

export function ErrorState({ title, message }) {
  return (
    <div className="rounded-2xl border border-red-900/40 bg-red-950/20 p-6 shadow-card">
      <p className="text-sm font-semibold text-red-300">{title}</p>
      <p className="mt-1 text-xs text-red-400/80">{message || "Please try again shortly."}</p>
    </div>
  );
}
