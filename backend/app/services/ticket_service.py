from sqlalchemy.orm import Session

from app.models import Ticket

from datetime import datetime


def get_open_ticket(
    db: Session,
    pole_id: int
):

    return (
        db.query(Ticket)
        .filter(
            Ticket.pole_id == pole_id,
            Ticket.status != "CLOSED"
        )
        .first()
    )


def create_ticket(
    db: Session,
    pole_id: int,
    pole_code: str
):

    ticket = Ticket(
        pole_id=pole_id,
        title="Power Outage",
        description=f"Power lost detected at {pole_code}",
        status="DETECTED",
        priority="HIGH"
    )

    db.add(ticket)
    db.commit()
    db.refresh(ticket)

    return ticket


def acknowledge_ticket(
    db: Session,
    ticket: Ticket
):

    ticket.status = "ACKNOWLEDGED"

    db.commit()
    db.refresh(ticket)

    return ticket


def assign_crew(
    db: Session,
    ticket: Ticket
):

    ticket.status = "CREW_ASSIGNED"

    db.commit()
    db.refresh(ticket)

    return ticket


def resolve_ticket(
    db: Session,
    ticket: Ticket
):

    ticket.status = "RESOLVED"

    db.commit()
    db.refresh(ticket)

    return ticket


def close_ticket(
    db: Session,
    ticket: Ticket
):

    ticket.status = "VERIFIED"

    db.commit()
    db.refresh(ticket)

    ticket.status = "CLOSED"

    ticket.closed_at = datetime.utcnow()

    db.commit()
    db.refresh(ticket)

    return ticket