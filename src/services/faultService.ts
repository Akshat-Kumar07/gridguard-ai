import api from "@/lib/axios";
import {
  ApiMessageResponse,
  SpanFaultRequest,
  DTFaultRequest,
  FeederFaultRequest,
  NoiseRequest,
  RepairRequest,
} from "@/types";

/**
 * Fault Simulator Service
 * All endpoints use existing backend APIs
 */

/** POST /faults/span — Inject span fault on a single pole */
export async function injectSpanFault(
  data: SpanFaultRequest
): Promise<ApiMessageResponse> {
  const response = await api.post<ApiMessageResponse>("/faults/span", data);
  return response.data;
}

/** POST /faults/dt — Inject DT fault on all poles of a transformer */
export async function injectDtFault(
  data: DTFaultRequest
): Promise<ApiMessageResponse> {
  const response = await api.post<ApiMessageResponse>("/faults/dt", data);
  return response.data;
}

/** POST /faults/feeder — Inject feeder fault on all poles of a feeder */
export async function injectFeederFault(
  data: FeederFaultRequest
): Promise<ApiMessageResponse> {
  const response = await api.post<ApiMessageResponse>("/faults/feeder", data);
  return response.data;
}

/** POST /faults/noise — Inject noise scenario (choices: 1-6) */
export async function injectNoise(
  data: NoiseRequest
): Promise<ApiMessageResponse> {
  const response = await api.post<ApiMessageResponse>("/faults/noise", data);
  return response.data;
}

/** POST /faults/repair — Repair fault by restoring all poles of a transformer */
export async function repairFault(
  data: RepairRequest
): Promise<ApiMessageResponse> {
  const response = await api.post<ApiMessageResponse>("/faults/repair", data);
  return response.data;
}
