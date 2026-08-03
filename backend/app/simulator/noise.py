import random
from datetime import datetime, UTC

import requests

from app.core.database import SessionLocal
from app.models import Pole, Telemetry

BASE_URL = "http://127.0.0.1:8000"


def get_next_sequence(db, pole):

    last = (
        db.query(Telemetry)
        .filter(
            Telemetry.device_id == pole.device_id
        )
        .order_by(
            Telemetry.seq.desc()
        )
        .first()
    )

    if last:
        return last.seq + 1

    return 1


def inject_noise(choice: str):

    db = SessionLocal()

    try:

        pole = random.choice(
            db.query(Pole).all()
        )

        seq = get_next_sequence(db, pole)

        telemetry = {

            "device_id": pole.device_id,
            "pole_id": pole.pole_code,
            "event": "power_lost",
            "energized": False,
            "ts": datetime.now(UTC).isoformat(),
            "seq": seq,
            "battery_mv": 3400,
            "rssi": -75,
            "fw": "1.4.2"

        }

        if choice == "1":

            print("Duplicate Message")

            requests.post(
                f"{BASE_URL}/telemetry/",
                json=telemetry
            )

            response = requests.post(
                f"{BASE_URL}/telemetry/",
                json=telemetry
            )

            print(response.status_code)
            print(response.text)

        elif choice == "2":

            print("Out-of-order Message")

            last = (
                db.query(Telemetry)
                .filter(
                    Telemetry.device_id == pole.device_id
                )
                .order_by(
                    Telemetry.seq.desc()
                )
                .first()
            )

            if last:
                telemetry["seq"] = max(1, last.seq - 1)
            else:
                telemetry["seq"] = 1

            response = requests.post(
                f"{BASE_URL}/telemetry/",
                json=telemetry
            )

            print(response.status_code)
            print(response.text)

        elif choice == "3":

            print("Device Failure")

            telemetry["event"] = "device_failure"
            telemetry["energized"] = True

            response = requests.post(
                f"{BASE_URL}/telemetry/",
                json=telemetry
            )

            print(response.status_code)
            print(response.text)

        elif choice == "4":

            print("Scheduled Outage")

            telemetry["event"] = "scheduled_outage"

            response = requests.post(
                f"{BASE_URL}/telemetry/",
                json=telemetry
            )

            print(response.status_code)
            print(response.text)

        elif choice == "5":

            print("30% Packet Loss")

            if random.random() < 0.3:

                print("Packet Dropped")

            else:

                response = requests.post(
                    f"{BASE_URL}/telemetry/",
                    json=telemetry
                )

                print(response.status_code)
                print(response.text)

        elif choice == "6":

            print("Firmware 1.2 Silent Device")

            telemetry["fw"] = "1.2"

            print("No telemetry sent.")

    finally:

        db.close()