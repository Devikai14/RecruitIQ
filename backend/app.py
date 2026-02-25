from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
import io

from core.graph import process_candidate
from core.scorer import infer_weights
from core.emailer import generate_selected_email, generate_rejected_email, generate_hr_email
from core.calendar_gen import generate_ics
from core.docx_report import generate_hr_docx

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

SENDER_EMAIL = "asn87884@gmail.com"
APP_PASSWORD  = "rrrxedausjqcdjec"
HR_EMAIL      = "devikaindu04@gmail.com"
SENDER_NAME   = "RecruitIQ System"
HR_NAME       = "HR Manager"


def sanitize(obj):
    import numpy as np
    if isinstance(obj, dict):
        return {k: sanitize(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [sanitize(v) for v in obj]
    elif isinstance(obj, (np.float32, np.float64)):
        return float(obj)
    elif isinstance(obj, (np.int32, np.int64)):
        return int(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    return obj


def send_plain_email(to_email, subject, body):
    if not to_email:
        return
    try:
        msg = MIMEText(body, "plain")
        msg["Subject"] = subject
        msg["From"]    = SENDER_EMAIL
        msg["To"]      = to_email
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=10) as server:
            server.login(SENDER_EMAIL, APP_PASSWORD)
            server.sendmail(SENDER_EMAIL, to_email, msg.as_string())
    except Exception as e:
        print(f"Email error to {to_email}: {e}")


def send_hr_email(to_email, subject, body, ics_bytes=None, docx_bytes=None):
    if not to_email:
        return
    try:
        msg = MIMEMultipart()
        msg["Subject"] = subject
        msg["From"]    = SENDER_EMAIL
        msg["To"]      = to_email
        msg.attach(MIMEText(body, "plain"))

        if ics_bytes:
            part = MIMEBase("text", "calendar", method="REQUEST")
            part.set_payload(ics_bytes)
            encoders.encode_base64(part)
            part.add_header("Content-Disposition", "attachment", filename="interview_schedule.ics")
            msg.attach(part)

        if docx_bytes:
            part2 = MIMEBase("application", "vnd.openxmlformats-officedocument.wordprocessingml.document")
            part2.set_payload(docx_bytes)
            encoders.encode_base64(part2)
            part2.add_header("Content-Disposition", "attachment", filename="candidate_profiles.docx")
            msg.attach(part2)

        with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=10) as server:
            server.login(SENDER_EMAIL, APP_PASSWORD)
            server.sendmail(SENDER_EMAIL, to_email, msg.as_string())
    except Exception as e:
        print(f"HR email error: {e}")


@app.post("/process")
async def process_candidates(
    required_skills:  str  = Form(...),
    min_experience:   int  = Form(...),
    interview_date:   str  = Form(...),
    start_time:       str  = Form(...),
    total_duration:   int  = Form(...),
    job_description:  str  = Form(""),
    sender_name:      str  = Form(SENDER_NAME),
    sender_email:     str  = Form(SENDER_EMAIL),
    hr_name:          str  = Form(HR_NAME),
    hr_email:         str  = Form(HR_EMAIL),
    files: list[UploadFile] = File(...),
):
    skill_list = [s.strip() for s in required_skills.split(",") if s.strip()]
    jd_text    = job_description if job_description else required_skills
    weights    = infer_weights(jd_text)

    candidates = []
    for file in files:
        content   = await file.read()
        file_like = io.BytesIO(content)
        file_like.name = file.filename
        from core.parser import extract_text
        raw_text = extract_text(file_like)
        result   = process_candidate(
            raw_text=raw_text,
            filename=file.filename,
            skill_list=skill_list,
            min_experience=min_experience,
            weights=weights,
        )
        result["total_skills"] = len(skill_list)
        result = sanitize(result)
        candidates.append(result)

    candidates.sort(key=lambda x: x.get("score", 0), reverse=True)
    top_candidates      = candidates[:5]
    rejected_candidates = candidates[5:]

    # Slot allocation
    if top_candidates:
        slot_dur = total_duration // len(top_candidates)
        base_dt  = datetime.strptime(f"{interview_date} {start_time}", "%Y-%m-%d %H:%M")
        for i, c in enumerate(top_candidates):
            s = base_dt + timedelta(minutes=i * slot_dur)
            e = s + timedelta(minutes=slot_dur)
            c["slot"] = f"{s.strftime('%H:%M')} - {e.strftime('%H:%M')}"

    # Calendar .ics
    ics_bytes = None
    try:
        ics_bytes = generate_ics(top_candidates, interview_date, attendees_emails=[hr_email])
    except Exception as e:
        print("ICS error:", e)

    # DOCX report (now includes quality scores)
    docx_bytes = None
    try:
        docx_bytes = generate_hr_docx(top_candidates, interview_date, hr_name)
    except Exception as e:
        print("DOCX error:", e)

    # Candidate emails
    for c in top_candidates:
        if c.get("email"):
            em = generate_selected_email(c, interview_date, sender_name, sender_email, job_role=job_description)
            send_plain_email(c["email"], em["subject"], em["body"])

    for c in rejected_candidates:
        if c.get("email"):
            em = generate_rejected_email(c, sender_name, sender_email)
            send_plain_email(c["email"], em["subject"], em["body"])

    # HR email with attachments
    hr_em = generate_hr_email(top_candidates, interview_date, hr_name, sender_name)
    send_hr_email(hr_email, hr_em["subject"], hr_em["body"], ics_bytes, docx_bytes)

    return {
        "top_candidates":      top_candidates,
        "rejected_candidates": rejected_candidates,
        "weights": {
            "semantic":   float(weights[0]),
            "skill":      float(weights[1]),
            "experience": float(weights[2]),
        },
    }


@app.get("/health")
def health():
    return {"status": "ok", "version": "4.0-quality-score"}
