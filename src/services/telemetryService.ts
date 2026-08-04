import api from "@/lib/axios";
import { Telemetry } from "@/types";

/**
 * Telemetry Service
 *
 * TODO: Replace getMockTelemetry with actual backend endpoint when available
 * Needed: GET /telemetry — returns list of telemetry records (newest first)
 * Currently returns realistic mock data based on backend Telemetry model
 */

export async function getTelemetryRecords(): Promise<Telemetry[]> {
  // Try real API first if it exists, fall back to mock
  try {
    const response = await api.get<Telemetry[]>("/telemetry");
    return response.data;
  } catch {
    return getMockTelemetry();
  }
}

function getMockTelemetry(): Telemetry[] {
  const now = new Date();
  return [
    {
      id: 1,
      pole_id: 1,
      device_id: "DEV-P001",
      event: "heartbeat",
      energized: true,
      ts: new Date(now.getTime() - 60000).toISOString(),
      seq: 42,
      battery_mv: 3520,
      rssi: -72,
      fw: "1.4.2",
      received_at: new Date(now.getTime() - 59000).toISOString(),
    },
    {
      id: 2,
      pole_id: 3,
      device_id: "DEV-P003",
      event: "power_lost",
      energized: false,
      ts: new Date(now.getTime() - 120000).toISOString(),
      seq: 15,
      battery_mv: 3380,
      rssi: -85,
      fw: "1.4.2",
      received_at: new Date(now.getTime() - 119000).toISOString(),
    },
    {
      id: 3,
      pole_id: 5,
      device_id: "DEV-P005",
      event: "power_restored",
      energized: true,
      ts: new Date(now.getTime() - 300000).toISOString(),
      seq: 28,
      battery_mv: 3450,
      rssi: -68,
      fw: "1.4.2",
      received_at: new Date(now.getTime() - 299000).toISOString(),
    },
    {
      id: 4,
      pole_id: 2,
      device_id: "DEV-P002",
      event: "heartbeat",
      energized: true,
      ts: new Date(now.getTime() - 420000).toISOString(),
      seq: 56,
      battery_mv: 3500,
      rssi: -75,
      fw: "1.4.2",
      received_at: new Date(now.getTime() - 419000).toISOString(),
    },
    {
      id: 5,
      pole_id: 7,
      device_id: "DEV-P007",
      event: "power_lost",
      energized: false,
      ts: new Date(now.getTime() - 600000).toISOString(),
      seq: 9,
      battery_mv: 3340,
      rssi: -88,
      fw: "1.4.2",
      received_at: new Date(now.getTime() - 599000).toISOString(),
    },
    {
      id: 6,
      pole_id: 4,
      device_id: "DEV-P004",
      event: "boot",
      energized: true,
      ts: new Date(now.getTime() - 900000).toISOString(),
      seq: 0,
      battery_mv: 3600,
      rssi: -62,
      fw: "1.4.2",
      received_at: new Date(now.getTime() - 899000).toISOString(),
    },
    {
      id: 7,
      pole_id: 8,
      device_id: "DEV-P008",
      event: "device_failure",
      energized: true,
      ts: new Date(now.getTime() - 1200000).toISOString(),
      seq: 33,
      battery_mv: 3100,
      rssi: -92,
      fw: "1.4.2",
      received_at: new Date(now.getTime() - 1199000).toISOString(),
    },
    {
      id: 8,
      pole_id: 6,
      device_id: "DEV-P006",
      event: "heartbeat",
      energized: true,
      ts: new Date(now.getTime() - 1500000).toISOString(),
      seq: 71,
      battery_mv: 3480,
      rssi: -70,
      fw: "1.4.2",
      received_at: new Date(now.getTime() - 1499000).toISOString(),
    },
  ];
}
