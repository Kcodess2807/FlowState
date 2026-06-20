import json
import logging
from typing import Any

import httpx

from app.core.config import settings
from app.models.problem import Problem

logger = logging.getLogger("flowstate.grader")

_SYSTEM_PROMPT = (
    "You are a rigorous, fair senior system-design interviewer. You grade a "
    "candidate's solution strictly against the provided rubric. Award partial "
    "credit where due, be specific, and stay constructive. Judge the design's "
    "reasoning, not its wording."
)


def _rubric_lines(rubric: list[dict]) -> str:
    out = []
    for c in rubric:
        out.append(
            f"- [{c['key']}] {c.get('title', c['key'])} "
            f"(max {c.get('weight', 0)} pts): {c.get('description', '')}"
        )
    return "\n".join(out)


def _build_prompt(problem: Problem, explanation: str, design: dict | None) -> str:
    return (
        f"PROBLEM: {problem.title}\n{problem.description}\n\n"
        f"RUBRIC (score each criterion from 0 to its max):\n"
        f"{_rubric_lines(problem.rubric)}\n\n"
        f"REFERENCE SOLUTION (guidance only; do not require an exact match):\n"
        f"{problem.reference_solution or 'none provided'}\n\n"
        f"CANDIDATE SUBMISSION\nExplanation:\n{explanation}\n\n"
        f"Diagram JSON (optional):\n{json.dumps(design) if design else 'none'}\n\n"
        "Return ONLY a JSON object of the form:\n"
        '{"criteria":[{"key":"<rubric key>","score":<int>,"feedback":"<specific>"}],'
        '"summary":"<2-4 sentence overall assessment>"}\n'
        "Use the exact rubric keys. Do not invent criteria."
    )


def _extract_json(text: str) -> dict:
    text = text.strip()
    if text.startswith("```"):
        text = text.split("```", 2)[1]
        if text.startswith("json"):
            text = text[4:]
    start, end = text.find("{"), text.rfind("}")
    if start == -1 or end == -1:
        raise ValueError("no JSON object in model response")
    return json.loads(text[start : end + 1])


# merge the model's per-criterion scores back onto the rubric definition
def _assemble(problem: Problem, raw: dict, model: str) -> dict:
    scored = {c["key"]: c for c in raw.get("criteria", []) if "key" in c}
    criteria: list[dict] = []
    overall = max_score = 0
    for c in problem.rubric:
        weight = int(c.get("weight", 0))
        got = scored.get(c["key"], {})
        score = max(0, min(weight, int(got.get("score", 0))))
        criteria.append(
            {
                "key": c["key"],
                "title": c.get("title", c["key"]),
                "score": score,
                "max": weight,
                "feedback": str(got.get("feedback", "")).strip(),
            }
        )
        overall += score
        max_score += weight

    pct = (overall / max_score * 100) if max_score else 0
    return {
        "overall_score": overall,
        "max_score": max_score,
        "passed": pct >= settings.EVAL_PASS_THRESHOLD,
        "summary": str(raw.get("summary", "")).strip() or "No summary provided.",
        "criteria": criteria,
        "model": model,
    }


async def _grade_with_openrouter(
    problem: Problem, explanation: str, design: dict | None
) -> dict:
    headers = {
        "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "X-Title": "FlowState",
    }
    body = {
        "model": settings.EVAL_MODEL,
        "temperature": 0,
        "response_format": {"type": "json_object"},
        "messages": [
            {"role": "system", "content": _SYSTEM_PROMPT},
            {"role": "user", "content": _build_prompt(problem, explanation, design)},
        ],
    }
    async with httpx.AsyncClient(timeout=settings.EVAL_TIMEOUT_SECONDS) as client:
        resp = await client.post(
            f"{settings.OPENROUTER_BASE_URL}/chat/completions",
            headers=headers,
            json=body,
        )
        resp.raise_for_status()
        content = resp.json()["choices"][0]["message"]["content"]
    return _assemble(problem, _extract_json(content), settings.EVAL_MODEL)


# keyword-coverage fallback used when no AI key is set or the call fails;
# deterministic, keeps the feature working without a grader
def _grade_heuristic(
    problem: Problem, explanation: str, design: dict | None
) -> dict:
    text = explanation.lower()
    raw_criteria = []
    for c in problem.rubric:
        terms = {c["key"].lower(), c.get("title", "").lower()}
        terms |= set(c.get("description", "").lower().split())
        terms = {t for t in terms if len(t) > 3}
        hit = any(t in text for t in terms)
        weight = int(c.get("weight", 0))
        raw_criteria.append(
            {
                "key": c["key"],
                "score": round(weight * (0.7 if hit else 0.2)),
                "feedback": (
                    "Heuristic fallback (no AI grader configured): "
                    + ("relevant content detected." if hit else "little coverage found.")
                ),
            }
        )
    result = _assemble(problem, {"criteria": raw_criteria}, "fallback-heuristic")
    result["summary"] = (
        "Scored by the keyword-coverage fallback (no AI grader configured). "
        "Configure OPENROUTER_API_KEY for a real evaluation."
    )
    return result


async def grade_submission(
    problem: Problem, explanation: str, design: dict | None
) -> dict:
    if settings.OPENROUTER_API_KEY:
        try:
            return await _grade_with_openrouter(problem, explanation, design)
        except Exception as exc:  # never fail a submission over a grader error
            logger.warning("OpenRouter grading failed, using fallback: %s", exc)
    return _grade_heuristic(problem, explanation, design)
