import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState } from "react";
import { ErrorState } from "./RiskCard";

export default function ForecastChart({ weather, flood, loadingWeather, loadingFlood, errorWeather, errorFlood }) {
  const [tab, setTab] = useState("rainfall");

  const rainData = (weather?.hourly || []).slice(0, 24).map((h) => ({
    label: new Date(h.time).toLocaleTimeString([], { hour: "2-digit" }),
    precipitation: h.precipitation_mm ?? 0,
  }));

  const dischargeData = (flood?.daily || []).map((d) => ({
    label: new Date(d.date).toLocaleDateString([], { month: "short", day: "numeric" }),
    discharge: d.river_discharge ?? null,
  }));

  const loading = tab === "rainfall" ? loadingWeather : loadingFlood;
  const error = tab === "rainfall" ? errorWeather : errorFlood;

  return (
    <div className="rounded-2xl border border-navy-700 bg-navy-800/60 p-6 shadow-card">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Forecast</h3>
        <div className="flex rounded-lg bg-navy-700/50 p-1 text-xs">
          <TabButton active={tab === "rainfall"} onClick={() => setTab("rainfall")}>Rainfall (24h)</TabButton>
          <TabButton active={tab === "discharge"} onClick={() => setTab("discharge")}>River Discharge (14d)</TabButton>
        </div>
      </div>

      <div className="mt-4 h-64">
        {loading && <div className="skeleton h-full w-full" />}
        {!loading && error && <ErrorState title="Forecast unavailable" message={error} />}
        {!loading && !error && tab === "rainfall" && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={rainData}>
              <defs>
                <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2FA8E0" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#2FA8E0" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2A3F" />
              <XAxis dataKey="label" stroke="#64748B" fontSize={11} interval={3} />
              <YAxis stroke="#64748B" fontSize={11} unit="mm" width={40} />
              <Tooltip contentStyle={{ background: "#161D2E", border: "1px solid #2A374F", borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="precipitation" stroke="#2FA8E0" fill="url(#rainGradient)" strokeWidth={2} name="Rainfall (mm)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
        {!loading && !error && tab === "discharge" && (
          dischargeData.length === 0 || dischargeData.every((d) => d.discharge === null) ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">
              River discharge data unavailable for this location.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dischargeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2A3F" />
                <XAxis dataKey="label" stroke="#64748B" fontSize={11} interval={1} />
                <YAxis stroke="#64748B" fontSize={11} width={45} />
                <Tooltip contentStyle={{ background: "#161D2E", border: "1px solid #2A374F", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="discharge" stroke="#5EC8F2" strokeWidth={2} dot={false} name="Discharge (m³/s)" />
              </LineChart>
            </ResponsiveContainer>
          )
        )}
      </div>
    </div>
  );
}

function TabButton({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
        active ? "bg-water-600 text-white" : "text-slate-400 hover:text-slate-200"
      }`}
    >
      {children}
    </button>
  );
}
