from pydantic import BaseModel


class SpanFaultRequest(BaseModel):
    pole_code: str


class DTFaultRequest(BaseModel):
    transformer_code: str


class FeederFaultRequest(BaseModel):
    feeder_code: str


class RepairRequest(BaseModel):
    transformer_code: str

class SpanRepairRequest(BaseModel):
    pole_code: str

class FeederRepairRequest(BaseModel):
    feeder_code: str


class NoiseRequest(BaseModel):
    choice: str