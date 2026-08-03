from sqlalchemy.orm import Session

from app.models import Telemetry, Pole

from app.services.ticket_service import (
    get_open_ticket,
    create_ticket,
    close_ticket
)

from app.services.localization_service import (
    detect_fault_scope
)

from app.services.scheduled_outage_service import (
    is_scheduled_outage
)


def process_fault(
    db: Session,
    telemetry: Telemetry
):

    if telemetry.event == "power_lost":
        handle_power_lost(
            db,
            telemetry
        )

    elif telemetry.event == "power_restored":
        handle_power_restored(
            db,
            telemetry
        )

    elif telemetry.event == "heartbeat":
        print(
            f"[HEARTBEAT] {telemetry.device_id}"
        )

    elif telemetry.event == "boot":
        print(
            f"[BOOT] Device restarted: {telemetry.device_id}"
        )


def handle_power_lost(
    db: Session,
    telemetry: Telemetry
):

    pole = (
        db.query(Pole)
        .filter(
            Pole.id == telemetry.pole_id
        )
        .first()
    )

    if not pole:
        print("Pole not found.")
        return

    outage = is_scheduled_outage(
        db,
        feeder_code=pole.transformer.feeder.feeder_code,
        transformer_code=pole.transformer.transformer_code

)

    if outage:

        print(
            f"[SCHEDULED OUTAGE] {outage.reason}"
        )

        return

    print(
        f"[FAULT] Power lost at {pole.pole_code}"
    )

    print(
        f"Device: {telemetry.device_id}"
    )

    fault = detect_fault_scope(
        db,
        telemetry
)

    print(
        f"Fault Type: {fault['fault_type']}"
)

    print(
        f"Affected Poles: {fault['affected_poles']}"
)

    print(
        f"Total Poles: {fault['total_poles']}"
)

    location = fault.get("fault_location")

    if location:

        print(
            f"Span: {location['from']} -> {location['to']}"
    )

        print(
            f"Coordinates: "
            f"{location['latitude']}, "
            f"{location['longitude']}"
        )

        print(
            f"Pincode: {location['pincode']}"
        )

        print(
            f"Confidence: {location['confidence']}%"
        )

        print(
            f"Reason: {location['reason']}"
        )

    existing_ticket = get_open_ticket(
        db,
        pole.id
    )

    if existing_ticket:
        print("Open ticket already exists.")
        return

    ticket = create_ticket(
        db,
        pole.id,
        pole.pole_code
    )

    print(
        f"Ticket #{ticket.id} created successfully."
    )


def handle_power_restored(
    db: Session,
    telemetry: Telemetry
):

    pole = (
        db.query(Pole)
        .filter(
            Pole.id == telemetry.pole_id
        )
        .first()
    )

    if not pole:
        print("Pole not found.")
        return

    print(
        f"[RESTORE] Power restored at {pole.pole_code}"
    )

    ticket = get_open_ticket(
        db,
        pole.id
    )

    if not ticket:
        print("No open ticket found.")
        return

    close_ticket(
        db,
        ticket
    )

    print(
        f"Ticket #{ticket.id} closed successfully."
    )