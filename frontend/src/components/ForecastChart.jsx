import {
  AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import { useState } from "react";
import { ErrorState } from "./RiskCard";

// Custom tooltip that matches our dark theme
function DarkTooltip({ active, payload, label, unit = "" }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-navy-800/95 px-3 py-2.5 shadow-2xl backdrop-blur-xl">
      <p className="mb-1.5 text-[11px] font-semibold text-slate-400">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-xs font-bold" style={{ color: p.color }}>
          {p.name}:&nbsp;
          <span className="text-slate-200">
            {typeof p.value === "number" ? p.value.toFixed(2) : p.value}
            {unit}
          </span>
        </p>
      ))}
    </div>
  );
}

export default function ForecastChart({
  weather, flood,
  loadingWeather, loadingFlood,
  errorWeather, errorFlood,
}) {
  const [tab, setTab] = useState("rainfall");

  const rainData = (weather?.hourly || []).slice(0, 24).map((h) => ({
    label: new Date(h.time).toLocaleTimeString([], { hour: "2-digit", hour12: false }),
    precipitation: h.precipitation_mm ?? 0,
  }));

  const dischargeData = (flood?.daily || []).map((d) => ({
    label: new Date(d.date).toLocaleDateString([], { month: "short", day: "numeric" }),
    discharge: d.river_discharge ?? null,
  }));

  const loading = tab === "rainfall" ? loadingWeather : loadingFlood;
  const error   = tab === "rainfall" ? errorWeather  : errorFlood;

  const maxRain = Math.max(...rainData.map((d) => d.precipitation), 0.01);

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-navy-900/60 p-6 shadow-card backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
          Forecast
        </span>
        <div className="flex rounded-lg border border-white/[0.06] bg-navy-800/60 p-0.5 text-xs">
          <TabButton active={tab === "rainfall"} onClick={() => setTab("rainfall")}>
            Rainfall 24h
          </TabButton>
          <TabButton active={tab === "discharge"} onClick={() => setTab("discharge")}>
            River 14d
          </TabButton>
        </div>
      </div>

      {/* Chart area */}
      <div className="mt-4 h-64">
        {loading && <div className="skeleton h-full w-full rounded-xl" />}

        {!loading && error && <ErrorState title="Forecast unavailable" message={error} />}

        {!loading && !error && tab === "rainfall" && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={rainData} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
              <defs>
                <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#2FA8E0" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#2FA8E0" stopOpacity={0.02} />
                </linearGradient>
                <filter id="rainGlow" x="-10%" y="-50%" width="120%" height="200%">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1A2338" vertical={false} />
              <XAxis dataKey="label" stroke="#374151" tick={{ fill: "#64748B", fontSize: 10 }} tickLine={false} axisLine={false} interval={3} />
              <YAxis stroke="#374151" tick={{ fill: "#64748B", fontSize: 10 }} tickLine={false} axisLine={false} unit=" mm" width={42} />
              <Tooltip content={<DarkTooltip unit=" mm" />} />
              {maxRain > 5 && <ReferenceLine y={maxRain * 0.8} stroke="#F97316" strokeDasharray="4 3" strokeOpacity={0.5} />}
              <Area
                type="monotone"
                dataKey="precipitation"
                stroke="#2FA8E0"
                fill="url(#rainGradient)"
                strokeWidth={2}
                name="Rainfall"
                dot={false}
                activeDot={{ r: 4, fill: "#2FA8E0", stroke: "#0A0E17", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {!loading && !error && tab === "discharge" && (
          dischargeData.length === 0 || dischargeData.every((d) => d.discharge === null) ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
              <p className="text-sm text-slate-500">River discharge data unavailable for this location.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dischargeData} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
                <defs>
                  <filter id="lineGlow" x="-10%" y="-50%" width="120%" height="200%">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A2338" vertical={false} />
                <XAxis dataKey="label" stroke="#374151" tick={{ fill: "#64748B", fontSize: 10 }} tickLine={false} axisLine={false} interval={1} />
                <YAxis stroke="#374151" tick={{ fill: "#64748B", fontSize: 10 }} tickLine={false} axisLine={false} width={45} />
                <Tooltip content={<DarkTooltip unit=" m³/s" />} />
                <Line
                  type="monotone"
                  dataKey="discharge"
                  stroke="#5EC8F2"
                  strokeWidth={2}
                  dot={false}
                  name="Discharge"
                  activeDot={{ r: 4, fill: "#5EC8F2", stroke: "#0A0E17", strokeWidth: 2 }}
                  filter="url(#lineGlow)"
                />
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
      className={`rounded-md px-3 py-1.5 text-[11px] font-semibold transition-all duration-200 ${
        active
          ? "bg-water-600/80 text-white shadow-sm"
          : "text-slate-500 hover:text-slate-300"
      }`}
    >
      {children}
    </button>
  );
}
