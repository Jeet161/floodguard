"""Featherless AI integration.

Featherless AI exposes an OpenAI-compatible /chat/completions endpoint.
Docs: https://featherless.ai/docs

The backend is the ONLY source of factual flood/weather data. The AI is
only ever asked to explain and summarize numbers we already computed -
it is explicitly instructed not to invent measurements, evacuation
orders, or official warnings.
"""
import requests
from app.config import Config


class AIServiceError(Exception):
    pass


SYSTEM_PROMPT = """You are a flood-risk communication assistant embedded in the FloodGuard \
early-warning platform. You will be given structured, backend-calculated flood risk data for a \
specific location. Your job is ONLY to explain this data in clear, calm, non-alarmist language \
and suggest general, safe preparedness actions.

Strict rules:
- NEVER invent or alter any numeric measurement. Use only the numbers given to you.
- NEVER claim an official evacuation order, government warning, or emergency declaration exists \
unless it is explicitly present in the data given to you.
- NEVER state certainty about the future - use language like "may", "could", "is expected to".
- NEVER give dangerous instructions (e.g. driving through floodwater, ignoring official guidance).
- Always make clear this is AI-assisted interpretation, not an official emergency instruction.
- Keep the situation analysis to 2-4 sentences.
- Give 3-5 short, practical, generally-safe recommended actions as a bullet list.
- If data is marked unavailable, acknowledge the gap rather than guessing.
"""


def generate_analysis(context: dict) -> dict:
    """Send structured flood-risk context to Featherless AI and return
    {analysis: str, recommendations: [str]}.

    Raises AIServiceError if the API key isn't configured or the request fails,
    so the route can fall back to a rule-based summary instead of crashing.
    """
    if not Config.FEATHERLESS_API_KEY:
        raise AIServiceError("FEATHERLESS_API_KEY is not configured.")

    user_prompt = (
        "Here is the structured flood-risk data for this location. "
        "Write the situation analysis and recommendations described in your instructions.\n\n"
        f"{context}"
    )

    payload = {
        "model": Config.FEATHERLESS_MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": 0.4,
        "max_tokens": 500,
    }
    headers = {
        "Authorization": f"Bearer {Config.FEATHERLESS_API_KEY}",
        "Content-Type": "application/json",
    }

    try:
        resp = requests.post(
            f"{Config.FEATHERLESS_BASE_URL}/chat/completions",
            json=payload,
            headers=headers,
            timeout=Config.REQUEST_TIMEOUT,
        )
        resp.raise_for_status()
        data = resp.json()
        text = data["choices"][0]["message"]["content"]
    except requests.RequestException as exc:
        raise AIServiceError(f"Featherless AI request failed: {exc}") from exc
    except (KeyError, IndexError) as exc:
        raise AIServiceError(f"Featherless AI returned an unexpected response: {exc}") from exc

    return _split_analysis(text)


def _split_analysis(text: str) -> dict:
    """Best-effort split of the model's free text into analysis + bullet recommendations."""
    lines = [l.strip() for l in text.strip().splitlines() if l.strip()]
    recommendations = []
    analysis_lines = []
    for line in lines:
        if line.startswith(("-", "*", "•")) or (len(line) > 1 and line[0].isdigit() and line[1] in ".)"):
            recommendations.append(line.lstrip("-*•").strip())
        else:
            analysis_lines.append(line)
    return {
        "analysis": " ".join(analysis_lines).strip() or text.strip(),
        "recommendations": recommendations[:6],
    }
