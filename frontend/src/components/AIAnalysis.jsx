import { useState } from "react";
import { Sparkles, RefreshCw, Loader2, ChevronRight, AlertTriangle } from "lucide-react";
import { api } from "../services/api";

export default function AIAnalysis({ location, weather, flood, risk }) {
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  async function runAnalysis() {
    if (!risk) return;
    setLoading(true);
    setError(null);
    try {
      const payload = {
        location_name:                  location?.name,
        risk_score:                     risk.risk_score,
        risk_level:                     risk.risk_level,
        confidence:                     risk.confidence,
        factors:                        risk.factors,
        rainfall_next_24h_mm:           weather?.forecast_rain_next_24h_mm,
        rainfall_next_12h_mm:           weather?.forecast_rain_next_12h_mm,
        river_discharge_current:        flood?.current_discharge_m3s,
        river_discharge_peak_forecast:  flood?.peak_forecast_discharge_m3s,
        river_discharge_trend:          flood?.trend,
      };
      const data = await api.analyzeWithAI(payload);
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col rounded-2xl border border-water-500/[0.15] bg-gradient-to-br from-navy-900/80 to-navy-800/40 p-6 shadow-card backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-water-500/15">
            <Sparkles size={14} className="text-water-400" strokeWidth={2.5} />
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
            AI Situation Analysis
          </span>
        </div>

        {!result && (
          <button
            onClick={runAnalysis}
            disabled={loading || !risk}
            className="flex items-center gap-2 rounded-lg bg-water-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-water-600/25 transition-all duration-200 hover:bg-water-500 hover:shadow-water-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? <Loader2 size={13} className="animate-spin" strokeWidth={2.5} />
              : <Sparkles size={13} strokeWidth={2.5} />
            }
            {loading ? "Analyzing…" : "Generate Analysis"}
          </button>
        )}

        {result && (
          <button
            onClick={runAnalysis}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold text-water-400 transition-colors hover:bg-water-500/10 disabled:opacity-50"
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} strokeWidth={2.5} />
            Regenerate
          </button>
        )}
      </div>

      {/* Empty prompt */}
      {!result && !loading && !error && (
        <div className="mt-5 flex flex-col items-center gap-3 py-5 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-water-500/20 bg-water-500/8">
            <Sparkles size={22} className="text-water-400/60" strokeWidth={1.8} />
          </div>
          <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
            Generate a plain-language explanation of the current risk factors and safe next steps.
          </p>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="mt-5 flex flex-col items-center gap-3 py-5 text-center">
          <Loader2 size={28} className="animate-spin text-water-400" strokeWidth={1.8} />
          <p className="text-xs text-slate-500">Analyzing flood risk data…</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="mt-4 rounded-xl border border-red-900/30 bg-red-950/20 px-4 py-3 text-sm text-red-400">
          {error}
        </p>
      )}

      {/* Result */}
      {result && !loading && (
        <div className="mt-5 space-y-4">
          {/* Situation analysis */}
          <div className="rounded-xl border border-white/[0.05] bg-navy-800/40 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Situation
            </p>
            <p className="text-sm leading-relaxed text-slate-200">{result.analysis}</p>
          </div>

          {/* Recommendations */}
          {result.recommendations?.length > 0 && (
            <div>
              <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Recommended Actions
              </p>
              <ul className="space-y-2">
                {result.recommendations.map((r, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[13px] text-slate-300 leading-snug">
                    <ChevronRight
                      size={14}
                      className="mt-0.5 shrink-0 text-water-400"
                      strokeWidth={2.5}
                    />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Disclaimer */}
          <div className="flex items-start gap-2 rounded-xl border border-amber-500/15 bg-amber-500/8 px-3 py-2.5">
            <AlertTriangle size={12} className="mt-0.5 shrink-0 text-amber-400" strokeWidth={2.5} />
            <p className="text-[11px] text-amber-300/80 leading-relaxed">
              AI-assisted interpretation, not an official emergency instruction.
              {result.source === "fallback-rule-based" &&
                " (Generated via rule-based fallback — AI service unavailable.)"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
