from app.models import Pole


PINCODE_DATA = {

    "Ward-01": "560001",

    "Ward-02": "560002",

    "Ward-03": "560003",

    "Ward-04": "560004"

}


def get_pincode(
    pole: Pole
):

    # Already available
    if pole.pincode:
        return pole.pincode

    # Offline lookup
    return PINCODE_DATA.get(
        pole.ward,
        "UNKNOWN"
    )