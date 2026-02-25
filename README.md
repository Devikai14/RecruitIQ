# RecruitIQ v4 — AI-Powered Resume Screening and Interview scheduling System

RecruitIQ is an end-to-end autonomous hiring assistant that screens resumes, 
scores candidates, schedules interviews, and sends personalised emails — all 
from a single button click.

Built with a FastAPI backend, a LangGraph agent pipeline, and a React frontend, 
it combines semantic AI matching with rule-based extraction to rank candidates 
objectively and eliminate manual resume review.

## What It Does

Upload any number of PDF or DOCX resumes alongside a job description. RecruitIQ 
automatically:

- Parses each resume to extract name, email, skills, experience, and projects
- Scores every candidate across three dimensions — semantic fit, skill match, 
  and experience — using dynamically inferred weights derived from the job 
  description
- Rates each resume on a 0–100 quality rubric that measures structure and 
  writing quality, independent of job fit
- Ranks all candidates and shortlists the top 5
- Allocates individual interview time slots
- Sends personalised invitation emails to shortlisted candidates and 
  constructive rejection emails (with resume improvement tips) to others
- Emails the HR manager a summary report with a .ics calendar file and a 
  formatted .docx candidate profiles document

## Tech Stack

| Layer | Technology |
|---|---|
| Backend API | FastAPI (Python) |
| AI Pipeline | LangGraph — 7-node stateful graph |
| Semantic Scoring | Sentence-BERT (all-MiniLM-L6-v2) |
| LLM | Groq — LLaMA3 (email generation, DOCX summaries) |
| Text Extraction | PyPDF2, python-docx |
| Calendar | icalendar (.ics generation) |
| Word Document | python-docx |
| Email Delivery | Python smtplib + Gmail SMTP |
| Frontend | React (single-file, no build framework) |

## Scoring System

Each candidate receives two independent scores:

**Match Score (0–100)** — how well the candidate fits the specific job:
- Semantic score: cosine similarity between resume and JD embeddings (Sentence-BERT)
- Skill score: fraction of required keywords found in the resume
- Experience score: actual years vs minimum required

**Quality Score (0–100)** — how well the resume itself is written:
- Graded across 11 criteria including contact info, quantified achievements, 
  action verbs, section completeness, and resume length
- Completely independent of the job — the same resume scores identically 
  regardless of which role it is evaluated for
- Rejected candidates with a quality score below 60 receive specific, 
  actionable improvement tips in their rejection email


## Pipeline Architecture

Every resume passes through a 7-node LangGraph state machine:
```
parse_resume → extract_skills → extract_experience → semantic_score
             → final_score → quality_score → generate_summary
```

Each node receives the full candidate state dictionary, does one job, 
and passes the updated state forward. The pipeline is sequential, 
inspectable, and designed to be extended with conditional branches 
or parallel nodes.


## Project Structure
```
recruitiq_v4/
├── backend/
│   ├── app.py                  ← FastAPI entry point, routing, SMTP
│   ├── requirements.txt
│   └── core/
│       ├── graph.py            ← LangGraph 7-node pipeline
│       ├── parser.py           ← PDF/DOCX extraction, regex parsing
│       ├── scorer.py           ← Sentence-BERT scoring, weight inference
│       ├── quality.py          ← Resume quality rubric (11 criteria)
│       ├── emailer.py          ← Groq AI email generation
│       ├── calendar_gen.py     ← .ics calendar file generation
│       └── docx_report.py      ← HR candidate profiles Word document
└── frontend/
    └── src/
        └── App.js              ← React UI (Setup / Results / Emails tabs)
```


## Getting Started

**Prerequisites:** Python 3.10+, Node.js 18+, a free [Groq API key](https://console.groq.com)
```bash
# Backend
cd backend
pip install -r requirements.txt
GROQ_API_KEY=your_key_here uvicorn app:app --reload

# Frontend (separate terminal)
cd frontend
npm install
npm start
```

Open http://localhost:3000

---

## Known Limitations

- Experience extraction only recognises literal phrases like "5 years" — 
  it misses date-range formats such as "Jan 2020 – Mar 2024", causing 
  many candidates to show 0 years
- The shortlist is hard-capped at 5 with no minimum score threshold
- Skill matching is exact keyword only — "ML" will not match 
  "Machine Learning"
- No duplicate resume detection

---

## Built With

- [FastAPI](https://fastapi.tiangolo.com)
- [LangGraph](https://langchain-ai.github.io/langgraph/)
- [Sentence Transformers](https://www.sbert.net)
- [Groq](https://groq.com)
- [React](https://react.dev)
- [python-docx](https://python-docx.readthedocs.io)
- [icalendar](https://icalendar.readthedocs.io)
