import { useState } from "react";
import { api } from "../services/api";

export default function AIAnalysis({ location, weather, flood, risk }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function runAnalysis() {
    if (!risk) return;
    setLoading(true);
    setError(null);
    try {
      const payload = {
        location_name: location?.name,
        risk_score: risk.risk_score,
        risk_level: risk.risk_level,
        confidence: risk.confidence,
        factors: risk.factors,
        rainfall_next_24h_mm: weather?.forecast_rain_next_24h_mm,
        rainfall_next_12h_mm: weather?.forecast_rain_next_12h_mm,
        river_discharge_current: flood?.current_discharge_m3s,
        river_discharge_peak_forecast: flood?.peak_forecast_discharge_m3s,
        river_discharge_trend: flood?.trend,
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
    <div className="rounded-2xl border border-navy-700 bg-gradient-to-br from-navy-800/80 to-navy-800/40 p-6 shadow-card">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
          ✨ AI Situation Analysis
        </h3>
        {!result && (
          <button
            onClick={runAnalysis}
            disabled={loading || !risk}
            className="rounded-lg bg-water-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-water-500 disabled:opacity-50"
          >
            {loading ? "Analyzing…" : "Generate Analysis"}
          </button>
        )}
      </div>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      {result && (
        <div className="mt-4">
          <p className="text-sm leading-relaxed text-slate-200">{result.analysis}</p>

          {result.recommendations?.length > 0 && (
            <>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">Recommended Actions</p>
              <ul className="mt-2 space-y-1.5">
                {result.recommendations.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-water-500" />
                    {r}
                  </li>
                ))}
              </ul>
            </>
          )}

          <p className="mt-4 rounded-lg bg-navy-700/40 px-3 py-2 text-[11px] text-slate-500">
            ⚠ AI-assisted interpretation, not an official emergency instruction.
            {result.source === "fallback-rule-based" && " (Generated via rule-based fallback — AI service unavailable.)"}
          </p>

          <button onClick={runAnalysis} className="mt-3 text-xs text-water-400 hover:underline">
            Regenerate
          </button>
        </div>
      )}

      {!result && !loading && !error && (
        <p className="mt-3 text-sm text-slate-500">
          Generate a plain-language explanation of the current risk factors and safe next steps.
        </p>
      )}
    </div>
  );
}
