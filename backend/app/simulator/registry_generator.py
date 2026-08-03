import random

from app.core.database import SessionLocal

from app.models import (
    Feeder,
    Transformer,
    Pole,
    PoleStatus
)


def generate_registry():

    db = SessionLocal()

    try:

        feeders = int(
            input("Feeders: ")
        )

        transformers_per_feeder = int(
            input("Transformers per Feeder: ")
        )

        poles_per_transformer = int(
            input("Poles per Transformer: ")
        )

        total = (
            feeders
            * transformers_per_feeder
            * poles_per_transformer
        )

        print(f"\nTotal Poles: {total}")

        confirm = input(
            "Generate? (y/n): "
        )

        if confirm.lower() != "y":
            return

        feeder_count = 100
        transformer_count = 100
        pole_count = 1000

        for _ in range(feeders):

            feeder = Feeder(

                feeder_code=f"F{feeder_count:03}",

                name=f"Feeder {feeder_count}",

                location="Simulator"

            )

            db.add(feeder)

            db.commit()

            db.refresh(feeder)

            feeder_count += 1

            for _ in range(
                transformers_per_feeder
            ):

                transformer = Transformer(

                    transformer_code=f"DT{transformer_count:04}",

                    name=f"Transformer {transformer_count}",

                    capacity_kva=random.choice(
                        [100,160,250,315]
                    ),

                    latitude=12.9 + random.random(),

                    longitude=77.5 + random.random(),

                    households_served=random.randint(
                        100,
                        800
                    ),

                    feeder_id=feeder.id

                )

                db.add(transformer)

                db.commit()

                db.refresh(transformer)

                transformer_count += 1

                previous = None

                for seq in range(
                    1,
                    poles_per_transformer + 1
                ):

                    pole = Pole(

                        pole_code=f"P{pole_count:06}",

                        latitude=12.9 + random.random(),

                        longitude=77.5 + random.random(),

                        device_id=f"DEV-{pole_count:06}",

                        seq_on_line=seq,

                        pole_type="Intermediate",

                        ward=f"Ward-{random.randint(1,20):02}",

                        pincode=random.choice(
                            [
                                "560001",
                                "560002",
                                "560003",
                                None
                            ]
                        ),

                        transformer_id=transformer.id,

                        parent_pole_id=previous

                    )

                    db.add(pole)

                    db.commit()

                    db.refresh(pole)

                    status = PoleStatus(

                        pole_id=pole.id,

                        energized=True,

                        last_event="boot"

                    )

                    db.add(status)

                    db.commit()

                    previous = pole.id

                    pole_count += 1

        print("\nRegistry Generated Successfully!")

    finally:

        db.close()