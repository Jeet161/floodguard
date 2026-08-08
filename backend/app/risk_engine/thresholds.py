"""Threshold constants used by the risk engine.

These are reasonable, documented heuristics for a hackathon-grade risk
model - NOT a scientifically validated hydrological model. They are
intentionally simple, transparent, and easy to tune later.
"""

# Rainfall thresholds (mm) over the next 24 hours
RAIN_24H_MODERATE = 20
RAIN_24H_HIGH = 50
RAIN_24H_CRITICAL = 90

# Rainfall thresholds (mm) over the next 12 hours (short, intense bursts)
RAIN_12H_MODERATE = 15
RAIN_12H_HIGH = 35
RAIN_12H_CRITICAL = 60

# River discharge trend weighting
TREND_SCORE = {
    "increasing": 20,
    "stable": 5,
    "decreasing": -10,
    "unknown": 0,
}

# Discharge ratio thresholds: current vs recent-mean baseline
DISCHARGE_RATIO_MODERATE = 1.2
DISCHARGE_RATIO_HIGH = 1.6
DISCHARGE_RATIO_CRITICAL = 2.2

RISK_LEVELS = [
    (0, 30, "LOW"),
    (30, 55, "MODERATE"),
    (55, 78, "HIGH"),
    (78, 101, "CRITICAL"),
]
