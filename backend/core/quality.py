"""
resume_quality.py — Resume Quality Score
==========================================
Rates how well-structured a resume is, INDEPENDENT of job requirements.
Same resume → same quality score regardless of which job it's evaluated for.

Scoring rubric (total = 100 points):
  Contact Info       : 20 pts  (email 10, phone 5, LinkedIn/GitHub 5)
  Content Sections   : 30 pts  (projects 15, education 10, summary 5)
  Achievement Quality: 25 pts  (quantified metrics 20, action verbs 5)
  Document Structure : 15 pts  (adequate length 10, not bloated -5)
  Extras             : 10 pts  (certifications 5, publications/awards 5)
"""

import re


# ── Regex patterns ────────────────────────────────────────────────────────────

EMAIL_RE    = re.compile(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+')
PHONE_RE    = re.compile(r'(\+\d{1,3}[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}')
LINKEDIN_RE = re.compile(r'linkedin\.com|linkedin\.in', re.IGNORECASE)
GITHUB_RE   = re.compile(r'github\.com', re.IGNORECASE)

# Quantified achievement: number followed by unit/context
QUANT_RE = re.compile(
    r'(\d+\.?\d*\s*(%|percent|x|times|k|million|billion|users|clients|'
    r'hours|days|months|years|projects|bugs|tickets|members|employees|'
    r'customers|transactions|requests|queries|ms|seconds|gb|tb|mb|'
    r'lines|commits|releases|deployments|countries|teams|products))',
    re.IGNORECASE
)

# Strong action verbs that indicate accomplishment framing
ACTION_VERB_RE = re.compile(
    r'\b(led|built|designed|developed|created|launched|deployed|delivered|'
    r'architected|engineered|optimised|optimized|improved|reduced|increased|'
    r'implemented|managed|spearheaded|automated|migrated|refactored|'
    r'established|founded|scaled|mentored|collaborated|coordinated|'
    r'researched|published|achieved|negotiated|streamlined|accelerated)\b',
    re.IGNORECASE
)

# Section header detection
PROJECTS_RE    = re.compile(r'\b(projects?|portfolio|work samples?|case studies?)\b', re.IGNORECASE)
EDUCATION_RE   = re.compile(r'\b(education|degree|bachelor|master|b\.?tech|m\.?tech|b\.?e|m\.?e|phd|diploma|university|college|gpa|cgpa)\b', re.IGNORECASE)
SUMMARY_RE     = re.compile(r'\b(summary|objective|profile|about me|professional profile|career objective)\b', re.IGNORECASE)
CERT_RE        = re.compile(r'\b(certif|certified|certification|certificate|aws certified|google certified|microsoft certified|pmp|cfa|cpa|cissp|coursera|udemy|edx)\b', re.IGNORECASE)
AWARD_RE       = re.compile(r'\b(award|honour|honor|recognition|achievement|scholarship|fellowship|publication|published|paper|journal|conference)\b', re.IGNORECASE)


# ── Individual checkers ───────────────────────────────────────────────────────

def _check_email(text):
    return 10 if EMAIL_RE.search(text) else 0

def _check_phone(text):
    return 5 if PHONE_RE.search(text) else 0

def _check_social(text):
    has_linkedin = bool(LINKEDIN_RE.search(text))
    has_github   = bool(GITHUB_RE.search(text))
    return 5 if (has_linkedin or has_github) else 0

def _check_projects(text):
    # Check for projects section AND actual project content (action verbs near project keywords)
    has_section = bool(PROJECTS_RE.search(text))
    action_count = len(ACTION_VERB_RE.findall(text))
    if has_section and action_count >= 3:
        return 15
    elif has_section or action_count >= 5:
        return 8
    return 0

def _check_education(text):
    return 10 if EDUCATION_RE.search(text) else 0

def _check_summary(text):
    return 5 if SUMMARY_RE.search(text) else 0

def _check_quantified(text):
    """Score based on how many quantified achievements exist."""
    matches = QUANT_RE.findall(text)
    count = len(matches)
    if count >= 5:
        return 20
    elif count >= 3:
        return 14
    elif count >= 1:
        return 7
    return 0

def _check_action_verbs(text):
    matches = ACTION_VERB_RE.findall(text)
    unique = set(m.lower() for m in matches)
    return 5 if len(unique) >= 4 else (3 if len(unique) >= 2 else 0)

def _check_length(text):
    words = len(text.split())
    if 300 <= words <= 1200:
        return 10          # ideal range
    elif 200 <= words < 300 or 1200 < words <= 1500:
        return 5           # acceptable
    elif words > 1500:
        return 0           # too long / bloated
    return 0               # too short

def _check_certifications(text):
    return 5 if CERT_RE.search(text) else 0

def _check_awards(text):
    return 5 if AWARD_RE.search(text) else 0


# ── Main scorer ───────────────────────────────────────────────────────────────

def compute_quality_score(text: str) -> dict:
    """
    Returns a dict with:
      - total_score     : int 0–100
      - grade           : str  'Excellent' | 'Good' | 'Fair' | 'Poor'
      - breakdown       : dict of each criterion → score earned
      - max_breakdown   : dict of each criterion → max possible
      - passed          : list of criteria that passed
      - failed          : list of criteria that failed (for feedback)
      - improvement_tips: list of actionable tips for failed criteria
    """

    breakdown = {
        "Email Address":         _check_email(text),
        "Phone Number":          _check_phone(text),
        "LinkedIn / GitHub":     _check_social(text),
        "Projects Section":      _check_projects(text),
        "Education Section":     _check_education(text),
        "Summary / Objective":   _check_summary(text),
        "Quantified Achievements": _check_quantified(text),
        "Action Verbs":          _check_action_verbs(text),
        "Resume Length":         _check_length(text),
        "Certifications":        _check_certifications(text),
        "Awards / Publications": _check_awards(text),
    }

    max_breakdown = {
        "Email Address":           10,
        "Phone Number":            5,
        "LinkedIn / GitHub":       5,
        "Projects Section":        15,
        "Education Section":       10,
        "Summary / Objective":     5,
        "Quantified Achievements": 20,
        "Action Verbs":            5,
        "Resume Length":           10,
        "Certifications":          5,
        "Awards / Publications":   5,
    }

    total = sum(breakdown.values())
    total = min(total, 100)   # cap at 100

    # Grade
    if total >= 80:
        grade = "Excellent"
    elif total >= 60:
        grade = "Good"
    elif total >= 40:
        grade = "Fair"
    else:
        grade = "Poor"

    # Passed / failed criteria
    passed = [k for k, v in breakdown.items() if v > 0]
    failed = [k for k, v in breakdown.items() if v == 0]

    # Actionable improvement tips for failed criteria
    tips_map = {
        "Email Address":           "Add a professional email address at the top of your resume.",
        "Phone Number":            "Include a phone number with country code for easy contact.",
        "LinkedIn / GitHub":       "Add your LinkedIn profile URL or GitHub link to showcase your work.",
        "Projects Section":        "Add a dedicated Projects section describing what you built and how.",
        "Education Section":       "Include your educational qualifications — degree, institution, and year.",
        "Summary / Objective":     "Write a 2-3 sentence professional summary at the top of your resume.",
        "Quantified Achievements": "Use numbers to quantify impact — e.g. 'reduced load time by 40%', 'served 10k users'.",
        "Action Verbs":            "Start bullet points with strong action verbs like 'Led', 'Built', 'Optimised'.",
        "Resume Length":           "Aim for 400–900 words. Too short lacks detail; too long loses attention.",
        "Certifications":          "Add relevant certifications (AWS, Google, Coursera, Udemy) to strengthen your profile.",
        "Awards / Publications":   "Mention any awards, recognitions, or publications if applicable.",
    }

    improvement_tips = [tips_map[k] for k in failed if k in tips_map]

    return {
        "total_score":      total,
        "grade":            grade,
        "breakdown":        breakdown,
        "max_breakdown":    max_breakdown,
        "passed":           passed,
        "failed":           failed,
        "improvement_tips": improvement_tips,
    }


def quality_grade_color(grade: str) -> str:
    """Return a hex color for the grade — used in docx report."""
    return {
        "Excellent": "#00C853",
        "Good":      "#FFB300",
        "Fair":      "#FF6D00",
        "Poor":      "#D50000",
    }.get(grade, "#888888")
