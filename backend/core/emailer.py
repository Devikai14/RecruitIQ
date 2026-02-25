import json
import os
import urllib.request
from datetime import datetime


def _fmt_date(date_str):
    try:
        return datetime.strptime(date_str, "%Y-%m-%d").strftime("%A, %d %B %Y")
    except Exception:
        return date_str


def _call_groq(prompt):
    api_key = os.environ.get("GROQ_API_KEY", "")
    if not api_key:
        return None
    try:
        payload = json.dumps({
            "model": "llama3-8b-8192",
            "max_tokens": 600,
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "You are a professional HR communication specialist. "
                        "Write clear, concise, and warm emails. "
                        "Never mention scores as fractions or 'out of 100'. "
                        "Never include greetings, subject lines, or sign-offs — only the body paragraph(s) requested."
                    )
                },
                {"role": "user", "content": prompt}
            ]
        }).encode("utf-8")
        req = urllib.request.Request(
            "https://api.groq.com/openai/v1/chat/completions",
            data=payload,
            headers={
                "Content-Type": "application/json",
                "Authorization": "Bearer " + api_key,
            },
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return data["choices"][0]["message"]["content"].strip()
    except Exception as e:
        print("Groq API error:", e)
        return None


def generate_selected_email(candidate, interview_date, sender_name, sender_email, job_role=""):
    name      = candidate.get("name", "Candidate")
    skills    = candidate.get("matched_skills", [])
    exp       = candidate.get("experience", 0)
    slot      = candidate.get("slot", "TBD")
    total     = candidate.get("total_skills", len(skills))
    fmt_date  = _fmt_date(interview_date)
    skill_str = ", ".join(skills[:6]) if skills else "various technologies"
    role_line = f" for the role of {job_role}" if job_role else ""

    groq_prompt = (
        f"Write a warm, professional 2-3 sentence paragraph for a job interview invitation email to {name}. "
        f"They are being invited for the position: {job_role if job_role else 'the advertised role'}. "
        f"They matched {len(skills)} out of {total} required skills, including: {skill_str}. "
        f"They have {exp} year(s) of relevant experience. "
        f"Explain briefly and encouragingly why they were selected. "
        f"Do NOT mention any score fractions, 'out of 100', or raw numbers. "
        f"Write ONLY the paragraph."
    )
    groq_body = _call_groq(groq_prompt)

    if not groq_body:
        groq_body = (
            f"After carefully reviewing your resume, we were impressed by your strong skill set "
            f"in {skill_str}, along with your {exp} year(s) of relevant experience. "
            f"Your profile stands out as an excellent match{role_line}, and we are excited "
            f"to move forward with your application."
        )

    lines = [
        "Dear " + name + ",",
        "",
        "We are pleased to inform you that you have been shortlisted" + role_line + ".",
        "Congratulations!",
        "",
        "Why you were selected:",
        "",
        groq_body,
        "",
        "Interview Details:",
        "",
        "  Date  :  " + fmt_date,
        "  Time  :  " + slot,
        "  Mode  :  To be confirmed by the HR team",
        "",
        "Please reply to this email to confirm your availability.",
        "If you need to reschedule, please inform us at least 24 hours in advance.",
        "",
        "We look forward to speaking with you.",
        "",
        "Warm regards,",
        sender_name,
        "RecruitIQ Hiring Team",
        sender_email,
    ]

    return {
        "subject": "Interview Invitation — " + name + " | RecruitIQ",
        "body": "\n".join(lines)
    }


def generate_rejected_email(candidate, sender_name, sender_email):
    name           = candidate.get("name", "Candidate")
    skills         = candidate.get("matched_skills", [])
    exp            = candidate.get("experience", 0)
    total          = candidate.get("total_skills", 1) or 1
    all_skills     = candidate.get("skill_list", [])
    missing_skills = [s for s in all_skills if s not in skills]
    missing_str    = ", ".join(missing_skills) if missing_skills else "N/A"
    skill_str      = ", ".join(skills) if skills else "none detected"

    # ── Quality score section (NEW) ───────────────────────────────────────────
    quality_score = candidate.get("quality_score")
    quality_grade = candidate.get("quality_grade", "")
    quality_tips  = candidate.get("quality_tips", [])
    quality_failed = candidate.get("quality_failed", [])

    # Build quality feedback block only if score is Fair or Poor
    quality_lines = []
    if quality_score is not None and quality_score < 60 and quality_tips:
        quality_lines = [
            "",
            "Resume Structure Feedback:",
            "",
            f"  Your resume scored {quality_score}/100 on structure and formatting ({quality_grade}).",
            "  Improving these areas will strengthen your applications everywhere, not just here:",
            "",
        ]
        for tip in quality_tips[:5]:
            quality_lines.append(f"  • {tip}")

    # Groq LLM body
    groq_prompt = (
        f"Write a compassionate and professional 2-3 sentence paragraph for a job rejection email to {name}. "
        f"They matched {len(skills)} of {total} required skills. "
        f"Skills they had: {skill_str}. Missing skills: {missing_str}. "
        f"They have {exp} year(s) of experience. "
        f"Be respectful and encouraging — mention they can improve and apply again. "
        f"Do NOT mention scores, fractions, or numbers. Write ONLY the paragraph."
    )
    groq_body = _call_groq(groq_prompt)

    if not groq_body:
        groq_body = (
            f"After a thorough review of all applications, we found that your current profile "
            f"did not fully meet the specific skill and experience requirements for this role. "
            f"We genuinely encourage you to continue developing your expertise and to consider "
            f"reapplying for future opportunities with us."
        )

    # Role-specific tips
    role_tips = []
    if missing_skills:
        role_tips.append("Develop proficiency in: " + ", ".join(missing_skills[:4]))
        role_tips.append("Consider certifications or courses in the missing areas")
    if exp < 2:
        role_tips.append("Gain hands-on experience through internships, freelancing, or open-source projects")
    role_tips.append("Tailor your resume closely to each job description")
    role_tips.append("Quantify your achievements with measurable outcomes")
    tip_block = "\n".join("  - " + t for t in role_tips)

    lines = [
        "Dear " + name + ",",
        "",
        "Thank you for taking the time to apply and for the effort you put into",
        "your application. We sincerely appreciate your interest in joining our team.",
        "",
        "After a careful review of all applications, we regret to inform you that",
        "we are unable to move forward with your application at this time.",
        "",
        "Profile Overview:",
        "",
        "  Skills Matched :  " + str(len(skills)) + " of " + str(total) + " required",
        "  Skills Found   :  " + skill_str,
        "  Missing Skills :  " + missing_str,
        "  Experience     :  " + str(exp) + " year(s)",
        "",
        "Feedback:",
        "",
        groq_body,
        "",
        "Tips to strengthen your profile for this type of role:",
        "",
        tip_block,
    ] + quality_lines + [   # ← quality feedback appended here
        "",
        "We encourage you to keep growing and to apply again in the future.",
        "We will retain your profile and may reach out for suitable opportunities.",
        "",
        "We wish you every success in your career journey.",
        "",
        "Warm regards,",
        sender_name,
        "RecruitIQ Hiring Team",
    ]

    return {
        "subject": "Application Update — " + name + " | RecruitIQ",
        "body": "\n".join(lines)
    }


def generate_hr_email(top_candidates, interview_date, hr_name, sender_name):
    fmt_date = _fmt_date(interview_date)

    candidate_lines = []
    for i, c in enumerate(top_candidates):
        skill_str = f"{len(c.get('matched_skills', []))}/{c.get('total_skills', '?')}"
        qs = c.get("quality_score")
        qg = c.get("quality_grade", "")
        quality_str = f"  |  Resume Quality: {qs}/100 ({qg})" if qs is not None else ""
        candidate_lines.append(
            f"  {i+1}. {c.get('name','?')}  —  Match: {c.get('score','?')}  |  "
            f"Skills: {skill_str}  |  Exp: {c.get('experience',0)} yr  |  "
            f"Slot: {c.get('slot','TBD')}{quality_str}"
        )
    table = "\n".join(candidate_lines)

    lines = [
        "Hi " + hr_name + ",",
        "",
        "Hope you're doing well. I've completed the resume screening for the upcoming round",
        "and wanted to share the shortlisted candidates with you.",
        "",
        f"We have {len(top_candidates)} candidate(s) scheduled for {fmt_date}:",
        "",
        table,
        "",
        "Note: Each candidate's Resume Quality Score (0–100) rates how well-structured",
        "their resume is — independent of job fit. This helps you know who may need",
        "resume coaching before the final interview round.",
        "",
        "I've attached the detailed candidate profiles document (.docx) and the interview",
        "schedule (.ics file) for your calendar. Just import it into Google Calendar or Outlook.",
        "",
        "Let me know if you'd like to make any changes to the schedule or candidate list.",
        "",
        "Thanks,",
        sender_name,
        "RecruitIQ System",
    ]

    return {
        "subject": f"Interview Schedule for {fmt_date} — RecruitIQ",
        "body": "\n".join(lines)
    }
