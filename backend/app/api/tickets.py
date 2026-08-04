from fastapi import APIRouter, Depends, HTTPException

from sqlalchemy.orm import Session

from app.core.database import get_db

from app.models import Ticket

from app.services.ticket_service import (
    acknowledge_ticket,
    assign_crew,
    resolve_ticket
)

router = APIRouter(
    prefix="/tickets",
    tags=["Tickets"]
)


@router.patch("/{ticket_id}/acknowledge")
def acknowledge(
    ticket_id: int,
    db: Session = Depends(get_db)
):

    ticket = (
        db.query(Ticket)
        .filter(
            Ticket.id == ticket_id
        )
        .first()
    )

    if not ticket:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found."
        )

    acknowledge_ticket(
        db,
        ticket
    )

    return {
        "message": "Ticket acknowledged.",
        "ticket": ticket
    }


@router.patch("/{ticket_id}/assign")
def assign(
    ticket_id: int,
    db: Session = Depends(get_db)
):

    ticket = (
        db.query(Ticket)
        .filter(
            Ticket.id == ticket_id
        )
        .first()
    )

    if not ticket:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found."
        )

    assign_crew(
        db,
        ticket
    )

    return {
        "message": "Crew assigned.",
        "ticket": ticket
    }


@router.patch("/{ticket_id}/resolve")
def resolve(
    ticket_id: int,
    db: Session = Depends(get_db)
):

    ticket = (
        db.query(Ticket)
        .filter(
            Ticket.id == ticket_id
        )
        .first()
    )

    if not ticket:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found."
        )

    resolve_ticket(
        db,
        ticket
    )

    return {
        "message": "Ticket resolved.",
        "ticket": ticket
    }

@router.get("/")
def get_all_tickets(
    db: Session = Depends(get_db)
):

    tickets = (
        db.query(Ticket)
        .all()
    )

    result = []

    for ticket in tickets:

        result.append({

            "id": ticket.id,

            "pole_id": ticket.pole_id,

            "pole_code": ticket.pole.pole_code,

            "title": ticket.title,

            "description": ticket.description,

            "status": ticket.status,

            "priority": ticket.priority,

            "created_at": ticket.created_at,

            "closed_at": ticket.closed_at

        })

    return result