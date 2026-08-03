from fastapi import APIRouter

from app.schemas.fault import (
    SpanFaultRequest,
    DTFaultRequest,
    FeederFaultRequest,
    RepairRequest,
    NoiseRequest
)

from app.simulator.fault_injector import (
    inject_span_fault,
    inject_dt_fault,
    inject_feeder_fault
)

from app.simulator.repair import repair_fault

from app.simulator.noise import inject_noise

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

@router.post("/repair")
def repair(request: RepairRequest):

    repair_fault(request.transformer_code)

    return {
        "message": "Repair Completed"
    }