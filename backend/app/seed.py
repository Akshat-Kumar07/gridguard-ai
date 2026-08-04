from app.core.database import SessionLocal
import random

from app.models import (
    Feeder,
    Transformer,
    Pole,
    PoleStatus,
    Telemetry,
    Ticket,
    ScheduledOutage
)

from datetime import datetime


def seed_database():

    db = SessionLocal()

    print("Clearing old data...")

    db.query(Telemetry).delete()
    db.query(Ticket).delete()
    db.query(PoleStatus).delete()
    db.query(ScheduledOutage).delete()
    db.query(Pole).delete()
    db.query(Transformer).delete()
    db.query(Feeder).delete()

    db.commit()

    print("Database cleared.")

    try:

        print("Creating Feeders...")

        feeders = []

        for i in range(1, 32):

            feeder = Feeder(
                feeder_code=f"F{i:03}",
                name=f"Feeder {i}",
                location="Bangalore"
            )

            db.add(feeder)
            feeders.append(feeder)

        db.commit()

        for feeder in feeders:
            db.refresh(feeder)

        print(f"{len(feeders)} Feeders Created")


        print("Creating Transformers...")

        transformers = []

        counter = 1

        for feeder in feeders:

            dt_count = 13

            if feeder == feeders[-1]:
                dt_count = 22      # Last feeder gets extra DTs

            for _ in range(dt_count):

                transformer = Transformer(

                    transformer_code=f"DT{counter:03}",

                    name=f"Distribution Transformer {counter}",

                    capacity_kva=random.choice([100,160,250,315]),

                    latitude=12.90 + random.random()*0.20,

                    longitude=77.45 + random.random()*0.25,

                    households_served=random.randint(80,600),

                    feeder_id=feeder.id

                )

                db.add(transformer)

                transformers.append(transformer)

                counter += 1

        db.commit()

        for transformer in transformers:
            db.refresh(transformer)

        print(f"{len(transformers)} Transformers Created")

        TOTAL_POLES = 38400
        TOTAL_TRANSFORMERS = 412
        TOTAL_DEVICE_POLES = 34900


        print("Creating Poles...")

        poles = []

        pole_counter = 1

        for index, transformer in enumerate(transformers):

            # Average ≈93 poles per transformer
            remaining_poles = TOTAL_POLES - (pole_counter - 1)

            remaining_transformers = TOTAL_TRANSFORMERS - index

            if remaining_transformers == 1:
                pole_count = remaining_poles
            else:
                avg = remaining_poles // remaining_transformers

                pole_count = random.randint(
                    max(9, avg - 20),
                    min(240, avg + 20)
                )

            parent_id = None

            for seq in range(1, pole_count + 1):

                device = None

                # Around 91% poles have telemetry devices
                device = None

                if pole_counter <= TOTAL_DEVICE_POLES:
                    device = f"DEV-{pole_counter:06}"

                pole = Pole(

                    pole_code=f"P{pole_counter:05}",

                    latitude=transformer.latitude + random.uniform(-0.002, 0.002),

                    longitude=transformer.longitude + random.uniform(-0.002, 0.002),

                    device_id=device,

                    seq_on_line=seq,

                    pole_type=(
                        "Root" if seq == 1
                        else "Leaf" if seq == pole_count
                        else "Intermediate"
                    ),

                    ward=f"Ward-{random.randint(1,20):02}",

                    pincode=f"560{random.randint(1,999):03}",

                    transformer_id=transformer.id,

                    parent_pole_id=parent_id
                )

                db.add(pole)

                db.flush()

                parent_id = pole.id

                poles.append(pole)

                pole_counter += 1

        db.commit()

        print(f"{len(poles)} Poles Created")


        # -----------------------------
        # Initialize Pole Status
        # -----------------------------
        print("Creating Pole Status...")

        statuses = []

        all_poles = db.query(Pole).all()

        for pole in all_poles:

            statuses.append(

                PoleStatus(
                    pole_id=pole.id,
                    energized=True,
                    last_event="boot"
                )

            )

        db.add_all(statuses)

        db.commit()

        print(f"{len(statuses)} Pole Status Records Created")
        print("=" * 50)
        print("DATABASE SEEDED SUCCESSFULLY")
        print(f"Feeders      : {len(feeders)}")
        print(f"Transformers : {len(transformers)}")
        print(f"Poles        : {len(poles)}")
        print(f"Pole Status  : {len(statuses)}")
        print("=" * 50)

        

    finally:
        db.close()


if __name__ == "__main__":
    seed_database()