export function timeAgo(date) {
  if (!date) return "—";
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export const RISK_COLORS = {
  LOW: "#2ECC71",
  MODERATE: "#F1C40F",
  HIGH: "#F97316",
  CRITICAL: "#EF4444",
};

export const RISK_BG = {
  LOW: "rgba(46,204,113,0.12)",
  MODERATE: "rgba(241,196,15,0.12)",
  HIGH: "rgba(249,115,22,0.12)",
  CRITICAL: "rgba(239,68,68,0.12)",
};

// Keep for backward compat — no longer rendered as emoji; used for fallback text
export const RISK_EMOJI = {
  LOW: "LOW",
  MODERATE: "MODERATE",
  HIGH: "HIGH",
  CRITICAL: "CRITICAL",
};

export function formatNumber(value, digits = 1) {
  if (value === null || value === undefined || Number.isNaN(value)) return "N/A";
  return Number(value).toFixed(digits);
}
