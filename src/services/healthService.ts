import api from "@/lib/axios";
import { ApiMessageResponse } from "@/types";

/**
 * Health Service
 * Uses: GET / (existing backend endpoint)
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await api.get<ApiMessageResponse>("/");
    return response.status === 200;
  } catch {
    return false;
  }
}
