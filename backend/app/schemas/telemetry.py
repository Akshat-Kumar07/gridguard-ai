from datetime import datetime
from typing import Literal

from pydantic import BaseModel


class TelemetryCreate(BaseModel):

    device_id: str

    pole_id: str

    event: Literal[
        "heartbeat",
        "power_lost",
        "power_restored",
        "boot",
        "device_failure",
        "scheduled_outage"
    ]

    energized: bool

    ts: datetime

    seq: int

    battery_mv: int

    rssi: int

    fw: str