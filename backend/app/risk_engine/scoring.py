from app.risk_engine import thresholds as T


def classify_level(score: float) -> str:
    for low, high, label in T.RISK_LEVELS:
        if low <= score < high:
            return label
    return "CRITICAL"


def clamp(value: float, lo: float = 0, hi: float = 100) -> float:
    return max(lo, min(hi, value))
