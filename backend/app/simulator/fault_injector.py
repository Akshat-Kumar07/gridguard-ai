import random
from datetime import datetime, UTC

import requests

from app.core.database import SessionLocal
from app.models import Pole, Transformer, Feeder, Telemetry

BASE_URL = "https://gridguard-ai-18s4.onrender.com"


def get_next_sequence(db, pole):

    last_packet = (
        db.query(Telemetry)
        .filter(
            Telemetry.device_id == pole.device_id
        )
        .order_by(
            Telemetry.seq.desc()
        )
        .first()
    )

    if last_packet:
        return last_packet.seq + 1

    return 1


# ---------------------------------------------------
# SPAN FAULT
# ---------------------------------------------------

def inject_span_fault(pole_code: str):

    db = SessionLocal()

    try:

        pole = (
            db.query(Pole)
            .filter(
                Pole.pole_code == pole_code
            )
            .first()
        )

        if not pole:
            print("Pole not found.")
            return

        telemetry = {

            "device_id": pole.device_id,

            "pole_id": pole.pole_code,

            "event": "power_lost",

            "energized": False,

            "ts": datetime.now(UTC).isoformat(),

            "seq": get_next_sequence(db, pole),

            "battery_mv": random.randint(3300, 3600),

            "rssi": random.randint(-90, -60),

            "fw": "1.4.2"

        }

        response = requests.post(

            f"{BASE_URL}/telemetry/",

            json=telemetry

        )

        print(
            pole.pole_code,
            response.status_code,
            response.text
        )

    finally:

        db.close()


# ---------------------------------------------------
# DT FAULT
# ---------------------------------------------------

def inject_dt_fault(transformer_code: str):

    db = SessionLocal()

    try:

        transformer = (
            db.query(Transformer)
            .filter(
                Transformer.transformer_code == transformer_code
            )
            .first()
        )

        if not transformer:
            print("Transformer not found.")
            return

        poles = (
            db.query(Pole)
            .filter(
                Pole.transformer_id == transformer.id
            )
            .all()
        )

        for pole in poles:

            telemetry = {

                "device_id": pole.device_id,

                "pole_id": pole.pole_code,

                "event": "power_lost",

                "energized": False,

                "ts": datetime.now(UTC).isoformat(),

                "seq": get_next_sequence(db, pole),

                "battery_mv": random.randint(3300, 3600),

                "rssi": random.randint(-90, -60),

                "fw": "1.4.2"

            }

            response = requests.post(

                f"{BASE_URL}/telemetry/",

                json=telemetry

            )

            print(
                pole.pole_code,
                response.status_code,
                response.text
            )

        print("\nDT Fault Injection Complete.")

    finally:

        db.close()


# ---------------------------------------------------
# FEEDER FAULT
# ---------------------------------------------------

def inject_feeder_fault(feeder_code: str):

    db = SessionLocal()

    try:

        feeder = (
            db.query(Feeder)
            .filter(
                Feeder.feeder_code == feeder_code
            )
            .first()
        )

        if not feeder:
            print("Feeder not found.")
            return

        transformers = (
            db.query(Transformer)
            .filter(
                Transformer.feeder_id == feeder.id
            )
            .all()
        )

        total_sent = 0

        for transformer in transformers:

            poles = (
                db.query(Pole)
                .filter(
                    Pole.transformer_id == transformer.id
                )
                .all()
            )

            for pole in poles:

                telemetry = {

                    "device_id": pole.device_id,

                    "pole_id": pole.pole_code,

                    "event": "power_lost",

                    "energized": False,

                    "ts": datetime.now(UTC).isoformat(),

                    "seq": get_next_sequence(db, pole),

                    "battery_mv": random.randint(3300, 3600),

                    "rssi": random.randint(-90, -60),

                    "fw": "1.4.2"

                }

                response = requests.post(

                    f"{BASE_URL}/telemetry/",

                    json=telemetry

                )

                print(
                    pole.pole_code,
                    response.status_code,
                    response.text
                )

                total_sent += 1

        print("\nFeeder Fault Injection Complete.")
        print(f"Telemetry Sent : {total_sent}")

    finally:

        db.close()