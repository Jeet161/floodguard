export function timeAgo(date) {
  if (!date) return "—";
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `Updated ${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  return `Updated ${hours} hour${hours === 1 ? "" : "s"} ago`;
}

export const RISK_COLORS = {
  LOW: "#2ECC71",
  MODERATE: "#F1C40F",
  HIGH: "#F39C12",
  CRITICAL: "#E74C3C",
};

export const RISK_EMOJI = {
  LOW: "🟢",
  MODERATE: "🟡",
  HIGH: "🟠",
  CRITICAL: "🔴",
};

export function formatNumber(value, digits = 1) {
  if (value === null || value === undefined || Number.isNaN(value)) return "N/A";
  return Number(value).toFixed(digits);
}
