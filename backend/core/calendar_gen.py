from icalendar import Calendar, Event
from datetime import datetime, timedelta
import uuid


def generate_ics(candidates, interview_date_str, attendees_emails):
    """
    Generate a single .ics file with one event per shortlisted candidate.
    attendees_emails: list of emails to invite (HR + candidate if available)
    """
    cal = Calendar()
    cal.add('prodid', '-//RecruitIQ//EN')
    cal.add('version', '2.0')
    cal.add('calscale', 'GREGORIAN')
    cal.add('method', 'REQUEST')

    for c in candidates:
        slot = c.get("slot", "09:00 - 10:00")
        try:
            start_str, end_str = slot.split(" - ")
            start_h, start_m = map(int, start_str.strip().split(":"))
            end_h, end_m = map(int, end_str.strip().split(":"))
            base_date = datetime.strptime(interview_date_str, "%Y-%m-%d")
            dt_start = base_date.replace(hour=start_h, minute=start_m)
            dt_end = base_date.replace(hour=end_h, minute=end_m)
        except Exception:
            base_date = datetime.strptime(interview_date_str, "%Y-%m-%d")
            dt_start = base_date.replace(hour=9, minute=0)
            dt_end = base_date.replace(hour=10, minute=0)

        event = Event()
        event.add('summary', f"Interview – {c.get('name', 'Candidate')}")
        event.add('dtstart', dt_start)
        event.add('dtend', dt_end)
        event.add('dtstamp', datetime.utcnow())
        event.add('uid', str(uuid.uuid4()))
        event.add('description',
            f"Candidate: {c.get('name')}\n"
            f"Score: {c.get('score')}\n"
            f"Skills: {', '.join(c.get('matched_skills', []))}\n"
            f"Experience: {c.get('experience', 0)} year(s)"
        )

        # Add attendees — HR only, no candidate emails
        all_attendees = list(set(filter(None, attendees_emails)))
        for email in all_attendees:
            event.add('attendee', f'mailto:{email}')

        cal.add_component(event)

    return cal.to_ical()
