import PyPDF2
from docx import Document
import re


def extract_text(file):
    text = ""
    if file.name.endswith(".pdf"):
        try:
            reader = PyPDF2.PdfReader(file)
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
        except Exception:
            pass
    elif file.name.endswith(".docx"):
        try:
            doc = Document(file)
            for para in doc.paragraphs:
                text += para.text + "\n"
        except Exception:
            pass
    return text


# Words that are definitely NOT names
BLACKLIST = re.compile(
    r'^(about|me|summary|objective|profile|resume|cv|curriculum|vitae|'
    r'skills|experience|education|contact|address|phone|email|mobile|'
    r'linkedin|github|portfolio|references|projects|achievements|'
    r'certifications|languages|hobbies|interests|declaration|'
    r'kerala|india|thiruvananthapuram|bangalore|chennai|mumbai|delhi|'
    r'bachelor|master|engineer|developer|designer|analyst|manager|'
    r'page|section|details|personal|professional|career|work|'
    r'january|february|march|april|may|june|july|august|september|'
    r'october|november|december)$',
    re.IGNORECASE
)

# Patterns that indicate this line is NOT a name
NON_NAME_PATTERNS = re.compile(
    r'[@|/\\:\d]|http|www\.|\.com|\.in|linkedin|github|'
    r'\+\d|\(\d|gmail|yahoo|outlook|hotmail',
    re.IGNORECASE
)


def extract_name(text):
    """
    Extract candidate name from resume.
    A name is 2-3 words, all title-cased, near the top of the document,
    not a city/country/section header/keyword.
    """
    lines = [l.strip() for l in text.splitlines() if l.strip()]

    for line in lines[:20]:
        # Skip if contains non-name patterns
        if NON_NAME_PATTERNS.search(line):
            continue

        # Remove extra spaces, punctuation except hyphens
        cleaned = re.sub(r"[^a-zA-Z\s\-]", "", line).strip()
        words = cleaned.split()

        if len(words) < 2 or len(words) > 4:
            continue

        # All words must start with capital letter, be reasonable length
        if not all(re.match(r'^[A-Z][a-zA-Z\-]{1,20}$', w) for w in words):
            continue

        # None of the words should be blacklisted
        if any(BLACKLIST.match(w) for w in words):
            continue

        # The line itself (lowercased) shouldn't be blacklisted
        if BLACKLIST.match(line.lower().replace(" ", "")):
            continue

        # Looks like a valid name
        return " ".join(words)

    # Fallback: try filename (strip extension, replace underscores/hyphens)
    return None  # caller will handle fallback


def extract_skills(text, required_skills):
    text_lower = text.lower()
    matched = []
    for skill in required_skills:
        pattern = r'\b' + re.escape(skill.strip().lower()) + r'\b'
        if re.search(pattern, text_lower):
            matched.append(skill.strip())
    return matched


def estimate_experience(text):
    matches = re.findall(r'(\d+)\+?\s+years?', text.lower())
    if matches:
        return max(int(m) for m in matches)
    return 0


def extract_email(text):
    pattern = r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+'
    matches = re.findall(pattern, text)
    if matches:
        return matches[0]
    return None


def extract_key_projects(text):
    projects = []
    for line in text.splitlines():
        line = line.strip()
        if len(line) < 20:
            continue
        if re.search(
            r'\b(project|built|developed|created|designed|implemented|'
            r'deployed|architected|led|launched|engineered)\b',
            line, re.IGNORECASE
        ):
            projects.append(line[:120])
        if len(projects) >= 3:
            break
    return projects if projects else ["No specific projects extracted"]
