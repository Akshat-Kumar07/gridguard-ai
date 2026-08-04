from fastapi import APIRouter

from app.schemas.fault import (
    SpanFaultRequest,
    DTFaultRequest,
    FeederFaultRequest,
    RepairRequest,
    SpanRepairRequest,
    FeederRepairRequest,
    NoiseRequest
)

from app.simulator.fault_injector import (
    inject_span_fault,
    inject_dt_fault,
    inject_feeder_fault
)


from app.simulator.noise import inject_noise

from app.simulator.repair import (
    repair_dt_fault,
    repair_span_fault,
    repair_feeder_fault
)

router = APIRouter(
    prefix="/faults",
    tags=["Fault Simulator"]
)


@router.get("/test")
def test():
    return {
        "message": "Fault API Working"
    }

@router.post("/span")
def span_fault(request: SpanFaultRequest):

    inject_span_fault(request.pole_code)

    return {
        "message": "Span Fault Injected"
    }

@router.post("/dt")
def dt_fault(request: DTFaultRequest):

    inject_dt_fault(request.transformer_code)

    return {
        "message": "DT Fault Injected"
    }

@router.post("/feeder")
def feeder_fault(request: FeederFaultRequest):

    inject_feeder_fault(request.feeder_code)

    return {
        "message": "Feeder Fault Injected"
    }

@router.post("/noise")
def noise(request: NoiseRequest):

    inject_noise(request.choice)

    return {
        "message": "Noise Injected"
    }

@router.post("/repair/dt")
def repair_dt(request: RepairRequest):

    repair_dt_fault(request.transformer_code)

    return {
        "message": "DT Repair Completed"
    }

@router.post("/repair/span")
def repair_span(request: SpanRepairRequest):

    repair_span_fault(request.pole_code)

    return {
        "message": "Span Repair Completed"
    }

@router.post("/repair/feeder")
def repair_feeder(request: FeederRepairRequest):

    repair_feeder_fault(request.feeder_code)

    return {
        "message": "Feeder Repair Completed"
    }