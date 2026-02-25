import re
from typing import TypedDict, List, Optional
from langgraph.graph import StateGraph, END

from core.parser import extract_skills, estimate_experience, extract_email, extract_key_projects
from core.scorer import compute_semantic_score, generate_ai_summary
from core.quality import compute_quality_score


class CandidateState(TypedDict):
    raw_text:         str
    filename:         str
    skill_list:       List[str]
    min_experience:   int
    weights:          tuple
    total_skills:     int
    name:             Optional[str]
    email:            Optional[str]
    matched_skills:   Optional[List[str]]
    experience:       Optional[int]
    projects:         Optional[List[str]]
    semantic_score:   Optional[float]
    skill_score:      Optional[float]
    experience_score: Optional[float]
    score:            Optional[float]
    slot:             Optional[str]
    ai_summary:       Optional[str]
    # ── Quality score fields ──────────────────────────────────────────────────
    quality_score:    Optional[int]
    quality_grade:    Optional[str]
    quality_breakdown: Optional[dict]
    quality_passed:   Optional[List[str]]
    quality_failed:   Optional[List[str]]
    quality_tips:     Optional[List[str]]


def _name_from_filename(filename):
    name = filename
    name = re.sub(r'\.(pdf|docx)$', '', name, flags=re.IGNORECASE)
    name = re.sub(r'[_\-\.]+', ' ', name)
    name = re.sub(
        r'\b(resume|cv|curriculum|vitae|updated|new|final|v\d+|\d{4}|'
        r'application|profile|hire|job|candidate)\b',
        '', name, flags=re.IGNORECASE
    )
    name = ' '.join(name.split()).strip().title()
    parts = name.split()
    if 2 <= len(parts) <= 4 and all(p.isalpha() for p in parts):
        return name
    if len(parts) == 1 and parts[0].isalpha() and len(parts[0]) > 2:
        return parts[0]
    return "Candidate"


# ── Pipeline nodes ────────────────────────────────────────────────────────────

def node_parse_resume(state: CandidateState) -> CandidateState:
    text = state["raw_text"]
    state["name"]     = _name_from_filename(state["filename"])
    state["email"]    = extract_email(text)
    state["projects"] = extract_key_projects(text)
    return state


def node_extract_skills(state: CandidateState) -> CandidateState:
    state["matched_skills"] = extract_skills(state["raw_text"], state["skill_list"])
    return state


def node_extract_experience(state: CandidateState) -> CandidateState:
    state["experience"] = estimate_experience(state["raw_text"])
    return state


def node_semantic_score(state: CandidateState) -> CandidateState:
    state["semantic_score"] = compute_semantic_score(state["skill_list"], state["raw_text"])
    return state


def node_final_score(state: CandidateState) -> CandidateState:
    matched  = len(state.get("matched_skills") or [])
    total    = state["total_skills"]
    exp      = state.get("experience") or 0
    min_exp  = state["min_experience"]
    semantic = state.get("semantic_score") or 0
    weights  = state.get("weights", (0.6, 0.3, 0.1))
    sw, skw, ew = weights

    skill_score      = (matched / total * 100) if total > 0 else 0
    experience_score = (100 if exp >= min_exp else (exp / min_exp * 100)) if min_exp > 0 else 100

    state["skill_score"]      = round(float(skill_score), 2)
    state["experience_score"] = round(float(experience_score), 2)
    state["score"]            = round(float(sw * semantic + skw * skill_score + ew * experience_score), 2)
    return state


def node_quality_score(state: CandidateState) -> CandidateState:
    """NEW NODE — computes resume quality score independent of job requirements."""
    result = compute_quality_score(state["raw_text"])
    state["quality_score"]     = result["total_score"]
    state["quality_grade"]     = result["grade"]
    state["quality_breakdown"] = result["breakdown"]
    state["quality_passed"]    = result["passed"]
    state["quality_failed"]    = result["failed"]
    state["quality_tips"]      = result["improvement_tips"]
    return state


def node_generate_summary(state: CandidateState) -> CandidateState:
    state["ai_summary"] = generate_ai_summary(
        state.get("name", "Candidate"),
        state.get("matched_skills", []),
        state.get("experience", 0),
        state.get("projects", [])
    )
    return state


# ── Build graph ───────────────────────────────────────────────────────────────

def build_candidate_graph():
    g = StateGraph(CandidateState)

    g.add_node("parse_resume",       node_parse_resume)
    g.add_node("extract_skills",     node_extract_skills)
    g.add_node("extract_experience", node_extract_experience)
    g.add_node("semantic_score",     node_semantic_score)
    g.add_node("final_score",        node_final_score)
    g.add_node("quality_score",      node_quality_score)   # ← NEW
    g.add_node("generate_summary",   node_generate_summary)

    g.set_entry_point("parse_resume")
    g.add_edge("parse_resume",       "extract_skills")
    g.add_edge("extract_skills",     "extract_experience")
    g.add_edge("extract_experience", "semantic_score")
    g.add_edge("semantic_score",     "final_score")
    g.add_edge("final_score",        "quality_score")      # ← NEW edge
    g.add_edge("quality_score",      "generate_summary")
    g.add_edge("generate_summary",   END)

    return g.compile()


CANDIDATE_GRAPH = build_candidate_graph()


def process_candidate(raw_text, filename, skill_list, min_experience, weights):
    initial: CandidateState = {
        "raw_text": raw_text, "filename": filename,
        "skill_list": skill_list, "min_experience": min_experience,
        "weights": weights, "total_skills": len(skill_list),
        "name": None, "email": None, "matched_skills": None,
        "experience": None, "projects": None, "semantic_score": None,
        "skill_score": None, "experience_score": None, "score": None,
        "slot": None, "ai_summary": None,
        # quality fields
        "quality_score": None, "quality_grade": None,
        "quality_breakdown": None, "quality_passed": None,
        "quality_failed": None, "quality_tips": None,
    }
    result = CANDIDATE_GRAPH.invoke(initial)
    result["skill_list"] = skill_list
    return dict(result)
