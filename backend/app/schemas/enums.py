from enum import Enum


class TelemetryEvent(str, Enum):
    HEARTBEAT = "heartbeat"
    POWER_LOST = "power_lost"
    POWER_RESTORED = "power_restored"
    BOOT = "boot"