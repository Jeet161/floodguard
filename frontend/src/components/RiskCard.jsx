import { ShieldAlert, CheckCircle, AlertTriangle, AlertOctagon, ChevronRight } from "lucide-react";
import { RISK_COLORS, RISK_BG, timeAgo } from "../utils/format";

const RISK_ICONS = {
  LOW: CheckCircle,
  MODERATE: AlertTriangle,
  HIGH: AlertTriangle,
  CRITICAL: AlertOctagon,
};

export default function RiskCard({ risk, loading, error, lastUpdated }) {
  if (loading) return <RiskCardSkeleton />;
  if (error) return <ErrorState title="Risk score unavailable" message={error} />;
  if (!risk) return null;

  const color = RISK_COLORS[risk.risk_level] ?? RISK_COLORS.LOW;
  const bg    = RISK_BG[risk.risk_level]    ?? RISK_BG.LOW;
  const score = risk.risk_score ?? 0;
  const circumference = 2 * Math.PI * 52;
  const offset = circumference - (score / 100) * circumference;
  const Icon = RISK_ICONS[risk.risk_level] ?? ShieldAlert;

  return (
    <div className="flex flex-col rounded-2xl border border-white/[0.06] bg-navy-900/60 p-6 shadow-card backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
          Flood Risk Score
        </span>
        <span className="text-[11px] text-slate-600">{timeAgo(lastUpdated)}</span>
      </div>

      {/* Gauge + badge */}
      <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row">
        {/* SVG radial gauge */}
        <div className="relative h-36 w-36 shrink-0">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
            {/* Track */}
            <circle cx="60" cy="60" r="52" fill="none" stroke="#1F2A3F" strokeWidth="10" />
            {/* Glow filter */}
            <defs>
              <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={color} stopOpacity="0.7" />
                <stop offset="100%" stopColor={color} />
              </linearGradient>
            </defs>
            {/* Fill arc */}
            <circle
              cx="60" cy="60" r="52"
              fill="none"
              stroke="url(#gaugeGrad)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              filter="url(#gaugeGlow)"
              style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)" }}
            />
          </svg>
          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="text-3xl font-black tabular-nums leading-none"
              style={{ color }}
            >
              {Math.round(score)}
            </span>
            <span className="mt-1 text-[10px] font-semibold text-slate-500 tracking-wider">/&nbsp;100</span>
          </div>
        </div>

        {/* Details */}
        <div className="flex-1">
          {/* Risk badge */}
          <div
            className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold tracking-wide"
            style={{ background: bg, color }}
          >
            <Icon size={13} strokeWidth={2.5} />
            {risk.risk_level} RISK
          </div>

          <p className="mt-3 text-[11px] text-slate-500 leading-relaxed">
            Confidence:&nbsp;
            <span className="font-semibold text-slate-400">
              {Math.round((risk.confidence ?? 0) * 100)}%
            </span>
            &nbsp;· Application-generated estimate
          </p>

          {/* Factors */}
          <ul className="mt-3 space-y-1.5">
            {risk.factors?.slice(0, 4).map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-[13px] text-slate-300 leading-snug">
                <ChevronRight
                  size={13}
                  className="mt-0.5 shrink-0"
                  style={{ color }}
                  strokeWidth={2.5}
                />
                {f}
              </li>
            ))}
          </ul>

          {risk.partial_data && (
            <p className="mt-3 flex items-center gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-300">
              <AlertTriangle size={12} strokeWidth={2.5} className="shrink-0" />
              Score calculated with partial data — some sources were unavailable.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function RiskCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-navy-900/60 p-6 shadow-card">
      <div className="skeleton h-3 w-36" />
      <div className="mt-5 flex items-center gap-6">
        <div className="skeleton h-36 w-36 rounded-full shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="skeleton h-6 w-28" />
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
    <div className="rounded-2xl border border-red-900/30 bg-red-950/20 p-6 shadow-card backdrop-blur-sm">
      <p className="text-sm font-semibold text-red-300">{title}</p>
      <p className="mt-1 text-[13px] text-red-400/70">{message || "Please try again shortly."}</p>
    </div>
  );
}
