import api from "@/lib/axios";
import { ScheduledOutage } from "@/types";

/**
 * Scheduled Outage Service
 * Uses: GET /scheduled-outages/?from_time=&to_time= (existing backend endpoint)
 */

export async function getScheduledOutages(
  fromTime: string,
  toTime: string
): Promise<ScheduledOutage[]> {
  const response = await api.get<ScheduledOutage[]>("/scheduled-outages/", {
    params: {
      from_time: fromTime,
      to_time: toTime,
    },
  });
  return response.data;
}
