from sqlalchemy.orm import Session

from app.models import Telemetry


class ValidationResult:

    def __init__(
        self,
        valid: bool,
        reason: str
    ):
        self.valid = valid
        self.reason = reason


def validate_telemetry(
    db: Session,
    telemetry
):

    existing = (
        db.query(Telemetry)
        .filter(
            Telemetry.device_id == telemetry.device_id,
            Telemetry.seq == telemetry.seq
        )
        .first()
    )
    

    if existing:
        return ValidationResult(
            valid=False,
            reason="Duplicate telemetry."
        )

    latest = (
    db.query(Telemetry)
    .filter(
        Telemetry.device_id == telemetry.device_id
    )
    .order_by(
        Telemetry.seq.desc()
    )
    .first()
)

    if (
    telemetry.event == "boot"
    and telemetry.seq == 0
):
        return ValidationResult(
            valid=True,
            reason="Boot sequence accepted."
        )

    if latest and telemetry.seq < latest.seq:
        return ValidationResult(
            valid=False,
            reason="Out-of-order telemetry."
        )

    return ValidationResult(
    valid=True,
    reason="Telemetry accepted."
)




