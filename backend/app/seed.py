from app.core.database import SessionLocal
from app.models import (
    Feeder,
    Transformer,
    Pole,
    PoleStatus
)

from datetime import datetime

from app.models import ScheduledOutage

def seed_database():

    db = SessionLocal()

    try:

        # Prevent duplicate data
        if db.query(Feeder).first():
            print("Database already seeded!")
            return

                # -----------------------------
        # Create Feeder
        # -----------------------------
        feeder = Feeder(
            feeder_code="F001",
            name="North Bangalore Feeder",
            location="Bangalore"
        )

        db.add(feeder)
        db.commit()
        db.refresh(feeder)

                # -----------------------------
        # Create Transformer 1
        # -----------------------------
        dt1 = Transformer(
            transformer_code="DT001",
            name="Distribution Transformer 1",
            capacity_kva=250,
            latitude=12.9715,
            longitude=77.5945,
            households_served=500,
            feeder_id=feeder.id
        )

        db.add(dt1)
        db.commit()
        db.refresh(dt1)

                # -----------------------------
        # Create Transformer 2
        # -----------------------------
        dt2 = Transformer(
            transformer_code="DT002",
            name="Distribution Transformer 2",
            capacity_kva=315,
            latitude=12.9750,
            longitude=77.5980,
            households_served=650,
            feeder_id=feeder.id
        )

        db.add(dt2)
        db.commit()
        db.refresh(dt2)


                # -----------------------------
        # Create Pole P001 (Root Pole)
        # -----------------------------
        p1 = Pole(
            pole_code="P001",
            latitude=12.9716,
            longitude=77.5946,
            device_id="DEV-P001",
            seq_on_line=1,
            pole_type="Root",
            ward="Ward-01",
            pincode="560001",
            transformer_id=dt1.id,
            parent_pole_id=None
        )

        db.add(p1)
        db.commit()
        db.refresh(p1)


                # -----------------------------
        # Create Pole P002
        # -----------------------------
        p2 = Pole(
            pole_code="P002",
            latitude=12.9717,
            longitude=77.5947,
            device_id="DEV-P002",
            seq_on_line=2,
            pole_type="Intermediate",
            ward="Ward-01",
            pincode="560001",
            transformer_id=dt1.id,
            parent_pole_id=p1.id
        )

        db.add(p2)
        db.commit()
        db.refresh(p2)

                # -----------------------------
        # Create Pole P003
        # -----------------------------
        p3 = Pole(
            pole_code="P003",
            latitude=12.9718,
            longitude=77.5948,
            device_id="DEV-P003",
            seq_on_line=3,
            pole_type="Intermediate",
            ward="Ward-01",
            pincode="560001",
            transformer_id=dt1.id,
            parent_pole_id=p2.id
        )

        db.add(p3)
        db.commit()
        db.refresh(p3)


                # -----------------------------
        # Create Pole P004
        # -----------------------------
        p4 = Pole(
            pole_code="P004",
            latitude=12.9719,
            longitude=77.5949,
            device_id="DEV-P004",
            seq_on_line=4,
            pole_type="Leaf",
            ward="Ward-01",
            pincode="560001",
            transformer_id=dt1.id,
            parent_pole_id=p3.id
        )

        db.add(p4)
        db.commit()
        db.refresh(p4)


                # -----------------------------
        # Create Pole P005 (Root Pole of DT002)
        # -----------------------------
        p5 = Pole(
            pole_code="P005",
            latitude=12.9751,
            longitude=77.5981,
            device_id="DEV-P005",
            seq_on_line=1,
            pole_type="Root",
            ward="Ward-02",
            pincode="560002",
            transformer_id=dt2.id,
            parent_pole_id=None
        )

        db.add(p5)
        db.commit()
        db.refresh(p5)

                # -----------------------------
        # Create Pole P006
        # -----------------------------
        p6 = Pole(
            pole_code="P006",
            latitude=12.9752,
            longitude=77.5982,
            device_id="DEV-P006",
            seq_on_line=2,
            pole_type="Intermediate",
            ward="Ward-02",
            pincode="560002",
            transformer_id=dt2.id,
            parent_pole_id=p5.id
        )

        db.add(p6)
        db.commit()
        db.refresh(p6)


                # -----------------------------
        # Create Pole P007
        # -----------------------------
        p7 = Pole(
            pole_code="P007",
            latitude=12.9753,
            longitude=77.5983,
            device_id="DEV-P007",
            seq_on_line=3,
            pole_type="Intermediate",
            ward="Ward-02",
            pincode="560002",
            transformer_id=dt2.id,
            parent_pole_id=p6.id
        )

        db.add(p7)
        db.commit()
        db.refresh(p7)

                # -----------------------------
        # Create Pole P008
        # -----------------------------
        p8 = Pole(
            pole_code="P008",
            latitude=12.9754,
            longitude=77.5984,
            device_id="DEV-P008",
            seq_on_line=4,
            pole_type="Leaf",
            ward="Ward-02",
            pincode="560002",
            transformer_id=dt2.id,
            parent_pole_id=p7.id
        )

        db.add(p8)
        db.commit()
        db.refresh(p8)

                # -----------------------------
        # Initialize Pole Status
        # -----------------------------
        all_poles = (
            db.query(Pole)
            .all()
        )

        for pole in all_poles:

            existing_status = (
            db.query(PoleStatus)
            .filter(
                PoleStatus.pole_id == pole.id
        )
            .first()
    )

            if existing_status:
                continue

            status = PoleStatus(
                pole_id=pole.id,
                energized=True,
                last_event="boot"
    )

            db.add(status)

        db.commit()

        outage1 = ScheduledOutage(
            outage_id="SO-2026-07-29-014",
            scope="feeder",
            target_id="F001",
            start=datetime.fromisoformat(
                "2026-07-29T10:00:00"
            ),
            end=datetime.fromisoformat(
                "2026-07-29T12:30:00"
            ),
            reason="Planned maintenance - jumper replacement"
)

        outage2 = ScheduledOutage(
            outage_id="SO-2026-07-29-021",
            scope="dt",
            target_id="DT002",
            start=datetime.fromisoformat(
                "2026-07-29T14:00:00"
            ),
            end=datetime.fromisoformat(
                "2026-07-29T15:00:00"
            ),
            reason="Load shedding"
)

        db.add(outage1)
        db.add(outage2)

        db.commit()

        print("Scheduled Outages initialized successfully!")

        print("Pole Status initialized successfully!")

        print("Database seeded successfully!")

    finally:
        db.close()


if __name__ == "__main__":
    seed_database()