from sqlalchemy.orm import Session

from app.models import (
    Pole,
    Telemetry,
    PoleStatus,
    Transformer
)

from app.services.geocoding_service import get_pincode


def get_current_pole(
    db: Session,
    telemetry: Telemetry
):

    return (
        db.query(Pole)
        .filter(
            Pole.id == telemetry.pole_id
        )
        .first()
    )


def get_affected_poles(
    db: Session,
    transformer_id: int
):

    return (
        db.query(PoleStatus)
        .join(
            Pole,
            Pole.id == PoleStatus.pole_id
        )
        .filter(
            Pole.transformer_id == transformer_id,
            PoleStatus.energized == False
        )
        .count()
    )


def get_total_poles_in_transformer(
    db: Session,
    transformer_id: int
):

    return (
        db.query(Pole)
        .filter(
            Pole.transformer_id == transformer_id
        )
        .count()
    )

def get_transformers_in_feeder(
    db: Session,
    feeder_id: int
):

    return (
        db.query(Transformer)
        .filter(
            Transformer.feeder_id == feeder_id
        )
        .all()
    )

def count_dt_faults(
    db: Session,
    feeder_id: int
):

    transformers = get_transformers_in_feeder(
        db,
        feeder_id
    )

    dt_faults = 0

    for transformer in transformers:

        affected = get_affected_poles(
            db,
            transformer.id
        )

        total = get_total_poles_in_transformer(
            db,
            transformer.id
        )

        if total == 0:
            continue

        percentage = (
            affected / total
        ) * 100

        if percentage >= 80:
            dt_faults += 1

    return dt_faults


def get_current_feeder_id(
    pole: Pole
):

    if not pole.transformer:
        return None

    return pole.transformer.feeder_id

def estimate_fault_location(
    db: Session,
    transformer_id: int
):

    poles = (
        db.query(Pole)
        .filter(
            Pole.transformer_id == transformer_id
        )
        .order_by(
            Pole.seq_on_line
        )
        .all()
    )

    previous_pole = None

    for pole in poles:

        status = (
            db.query(PoleStatus)
            .filter(
                PoleStatus.pole_id == pole.id
            )
            .first()
        )

        if not status:
            continue

        if previous_pole:

            previous_status = (
                db.query(PoleStatus)
                .filter(
                    PoleStatus.pole_id == previous_pole.id
                )
                .first()
            )

            if (
                previous_status
                and previous_status.energized
                and not status.energized
            ):

                return {

                    "from": previous_pole.pole_code,

                    "to": pole.pole_code,

                    "latitude": (
                        previous_pole.latitude
                        + pole.latitude
                    ) / 2,

                    "longitude": (
                        previous_pole.longitude
                        + pole.longitude
                    ) / 2,

                    "pincode": get_pincode(pole),

                    "confidence": 95,

                    "reason":
                    "Boundary between last energized pole and first de-energized pole."
                }

        previous_pole = pole

    return None


def detect_fault_scope(
    db: Session,
    telemetry: Telemetry
):

    pole = get_current_pole(
        db,
        telemetry
    )

    if not pole:
        return {
            "fault_type": "UNKNOWN"
        }

    affected_poles = get_affected_poles(
        db,
        pole.transformer_id
    )

    total_poles = get_total_poles_in_transformer(
        db,
        pole.transformer_id
    )

    fault_percentage = (
        affected_poles / total_poles
    ) * 100

    print(
        f"Fault Percentage: {fault_percentage:.2f}%"
    )

    feeder_id = get_current_feeder_id(
        pole
    )

    dt_faults = count_dt_faults(
        db,
        feeder_id
    )

    total_transformers = len(
        get_transformers_in_feeder(
            db,
            feeder_id
        )
    )

    print(
        f"DT Faults: {dt_faults}/{total_transformers}"
    )

    location = estimate_fault_location(
        db,
        pole.transformer_id
    )

    print(
        f"Estimated Fault Location: {location}"
    )

    # -------------------------
    # DT Fault Check (FIRST)
    # -------------------------
    if fault_percentage >= 80:

        return {
            "fault_type": "DT_FAULT",
            "affected_poles": affected_poles,
            "total_poles": total_poles,
            "fault_location": location
        }

    # -------------------------
    # Feeder Fault Check
    # -------------------------
    if total_transformers > 0:

        feeder_percentage = (
            dt_faults / total_transformers
        ) * 100

        print(
            f"Feeder Fault Percentage: {feeder_percentage:.2f}%"
        )

        if feeder_percentage >= 80:

            return {
                "fault_type": "FEEDER_FAULT",
                "affected_poles": affected_poles,
                "total_poles": total_poles,
                "fault_location": location
            }

    # -------------------------
    # Otherwise Span Fault
    # -------------------------
    return {
        "fault_type": "SPAN_FAULT",
        "affected_poles": affected_poles,
        "total_poles": total_poles,
        "fault_location": location
    }


    