from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import re

model = SentenceTransformer("all-MiniLM-L6-v2")


def infer_weights(job_description: str):
    """
    Dynamically infer scoring weights from the job description.
    Returns (semantic_w, skill_w, experience_w) that sum to 1.0
    """
    jd = job_description.lower()

    # Count signals
    skill_signals = len(re.findall(
        r'\b(python|react|typescript|sql|java|aws|docker|kubernetes|tensorflow|pytorch|'
        r'javascript|node|css|graphql|mongodb|postgresql|redis|git|linux|api)\b', jd))

    semantic_signals = len(re.findall(
        r'\b(research|nlp|machine learning|deep learning|llm|bert|transformer|'
        r'ai|artificial intelligence|computer vision|reinforcement)\b', jd))

    experience_signals = len(re.findall(
        r'\b(senior|lead|principal|architect|manager|head of|director|'
        r'\d+\+?\s+years?|experienced)\b', jd))

    total = skill_signals + semantic_signals + experience_signals
    if total == 0:
        return 0.5, 0.35, 0.15  # default

    sw = semantic_signals / total
    skw = skill_signals / total
    ew = experience_signals / total

    # Normalize to ensure they sum to 1 with minimums
    sw  = max(sw,  0.20)
    skw = max(skw, 0.20)
    ew  = max(ew,  0.10)
    s = sw + skw + ew
    return round(sw/s, 2), round(skw/s, 2), round(ew/s, 2)


def compute_semantic_score(required_skills, resume_text):
    job_text = " ".join(required_skills)
    job_embedding = model.encode(job_text)
    resume_embedding = model.encode(resume_text)
    similarity = cosine_similarity([job_embedding], [resume_embedding])[0][0]
    return float(similarity * 100)


def compute_final_score(semantic_score, matched_skill_count,
                        total_required_skills, experience, min_experience,
                        weights=(0.6, 0.3, 0.1)):
    sw, skw, ew = weights
    skill_score = (matched_skill_count / total_required_skills * 100) if total_required_skills > 0 else 0
    if min_experience > 0:
        experience_score = 100 if experience >= min_experience else (experience / min_experience) * 100
    else:
        experience_score = 100
    return sw * semantic_score + skw * skill_score + ew * experience_score


def generate_ai_summary(name, skills, experience, projects):
    """Simple rule-based AI summary (no external API needed)."""
    skill_str = ", ".join(skills[:5]) if skills else "various technologies"
    project_hint = projects[0][:80] if projects and projects[0] != "No specific projects extracted" else ""
    summary = (
        f"{name} is a professional with {experience} year(s) of experience "
        f"specialising in {skill_str}."
    )
    if project_hint:
        summary += f" Notable work includes: {project_hint}."
    return summary
