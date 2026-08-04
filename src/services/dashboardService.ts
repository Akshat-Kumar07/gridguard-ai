import api from "@/lib/axios";
import {
  DashboardStats,
  Feeder,
  Transformer,
  PoleWithStatus,
  ChartDataPoint,
} from "@/types";

/**
 * Dashboard Service
 *
 * TODO: All functions in this file use mock data.
 * Replace each with actual backend endpoints when available.
 */

/**
 * TODO: Replace with actual backend endpoint
 * Needed: GET /dashboard/stats — returns aggregated counts
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const response = await api.get<DashboardStats>("/dashboard/stats");
    return response.data;
  } catch {
    return getMockDashboardStats();
  }
}

function getMockDashboardStats(): DashboardStats {
  return {
    totalFeeders: 1,
    totalTransformers: 2,
    totalPoles: 8,
    activeFaults: 3,
    openTickets: 5,
    scheduledOutages: 2,
  };
}

/**
 * TODO: Replace with actual backend endpoint
 * Needed: GET /feeders — returns list of all feeders
 */
export async function getFeeders(): Promise<Feeder[]> {
  try {
    const response = await api.get<Feeder[]>("/dashboard/feeders");
    return response.data;
  } catch {
    return getMockFeeders();
  }
}

function getMockFeeders(): Feeder[] {
  return [
    {
      id: 1,
      feeder_code: "F001",
      name: "North Bangalore Feeder",
      location: "Bangalore",
    },
  ];
}

/**
 * TODO: Replace with actual backend endpoint
 * Needed: GET /transformers — returns list of all transformers
 */
export async function getTransformers(): Promise<Transformer[]> {
  try {
    const response = await api.get<Transformer[]>("/dashboard/transformers");
    return response.data;
  } catch {
    return getMockTransformers();
  }
}

function getMockTransformers(): Transformer[] {
  return [
    {
      id: 1,
      transformer_code: "DT001",
      name: "Distribution Transformer 1",
      capacity_kva: 250,
      latitude: 12.9715,
      longitude: 77.5945,
      households_served: 500,
      feeder_id: 1,
    },
    {
      id: 2,
      transformer_code: "DT002",
      name: "Distribution Transformer 2",
      capacity_kva: 315,
      latitude: 12.975,
      longitude: 77.598,
      households_served: 650,
      feeder_id: 1,
    },
  ];
}

/**
 * TODO: Replace with actual backend endpoint
 * Needed: GET /poles — returns list of all poles with status info
 */
export async function getPoles(): Promise<PoleWithStatus[]> {
  try {
    const response = await api.get<PoleWithStatus[]>("/dashboard/poles");
    return response.data;
  } catch {
    return getMockPoles();
  }
}

function getMockPoles(): PoleWithStatus[] {
  return [
    {
      id: 1,
      pole_code: "P001",
      latitude: 12.9716,
      longitude: 77.5946,
      device_id: "DEV-P001",
      seq_on_line: 1,
      pole_type: "Root",
      ward: "Ward-01",
      pincode: "560001",
      is_active: true,
      transformer_id: 1,
      parent_pole_id: null,
      transformer_code: "DT001",
      status: {
        id: 1,
        pole_id: 1,
        energized: true,
        last_event: "heartbeat",
        last_seen: new Date().toISOString(),
      },
    },
    {
      id: 2,
      pole_code: "P002",
      latitude: 12.9717,
      longitude: 77.5947,
      device_id: "DEV-P002",
      seq_on_line: 2,
      pole_type: "Intermediate",
      ward: "Ward-01",
      pincode: "560001",
      is_active: true,
      transformer_id: 1,
      parent_pole_id: 1,
      transformer_code: "DT001",
      status: {
        id: 2,
        pole_id: 2,
        energized: true,
        last_event: "heartbeat",
        last_seen: new Date().toISOString(),
      },
    },
    {
      id: 3,
      pole_code: "P003",
      latitude: 12.9718,
      longitude: 77.5948,
      device_id: "DEV-P003",
      seq_on_line: 3,
      pole_type: "Intermediate",
      ward: "Ward-01",
      pincode: "560001",
      is_active: true,
      transformer_id: 1,
      parent_pole_id: 2,
      transformer_code: "DT001",
      status: {
        id: 3,
        pole_id: 3,
        energized: false,
        last_event: "power_lost",
        last_seen: new Date().toISOString(),
      },
    },
    {
      id: 4,
      pole_code: "P004",
      latitude: 12.9719,
      longitude: 77.5949,
      device_id: "DEV-P004",
      seq_on_line: 4,
      pole_type: "Leaf",
      ward: "Ward-01",
      pincode: "560001",
      is_active: true,
      transformer_id: 1,
      parent_pole_id: 3,
      transformer_code: "DT001",
      status: {
        id: 4,
        pole_id: 4,
        energized: true,
        last_event: "boot",
        last_seen: new Date().toISOString(),
      },
    },
    {
      id: 5,
      pole_code: "P005",
      latitude: 12.9751,
      longitude: 77.5981,
      device_id: "DEV-P005",
      seq_on_line: 1,
      pole_type: "Root",
      ward: "Ward-02",
      pincode: "560002",
      is_active: true,
      transformer_id: 2,
      parent_pole_id: null,
      transformer_code: "DT002",
      status: {
        id: 5,
        pole_id: 5,
        energized: false,
        last_event: "power_lost",
        last_seen: new Date().toISOString(),
      },
    },
    {
      id: 6,
      pole_code: "P006",
      latitude: 12.9752,
      longitude: 77.5982,
      device_id: "DEV-P006",
      seq_on_line: 2,
      pole_type: "Intermediate",
      ward: "Ward-02",
      pincode: "560002",
      is_active: true,
      transformer_id: 2,
      parent_pole_id: 5,
      transformer_code: "DT002",
      status: {
        id: 6,
        pole_id: 6,
        energized: true,
        last_event: "heartbeat",
        last_seen: new Date().toISOString(),
      },
    },
    {
      id: 7,
      pole_code: "P007",
      latitude: 12.9753,
      longitude: 77.5983,
      device_id: "DEV-P007",
      seq_on_line: 3,
      pole_type: "Intermediate",
      ward: "Ward-02",
      pincode: "560002",
      is_active: true,
      transformer_id: 2,
      parent_pole_id: 6,
      transformer_code: "DT002",
      status: {
        id: 7,
        pole_id: 7,
        energized: false,
        last_event: "power_lost",
        last_seen: new Date().toISOString(),
      },
    },
    {
      id: 8,
      pole_code: "P008",
      latitude: 12.9754,
      longitude: 77.5984,
      device_id: "DEV-P008",
      seq_on_line: 4,
      pole_type: "Leaf",
      ward: "Ward-02",
      pincode: "560002",
      is_active: true,
      transformer_id: 2,
      parent_pole_id: 7,
      transformer_code: "DT002",
      status: {
        id: 8,
        pole_id: 8,
        energized: true,
        last_event: "heartbeat",
        last_seen: new Date().toISOString(),
      },
    },
  ];
}

/**
 * TODO: Replace with actual backend endpoint
 * Needed: GET /dashboard/fault-trend — returns fault trend over time
 */
export function getMockFaultTrend(): ChartDataPoint[] {
  return [
    { name: "Mon", faults: 4, resolved: 3 },
    { name: "Tue", faults: 6, resolved: 5 },
    { name: "Wed", faults: 2, resolved: 2 },
    { name: "Thu", faults: 8, resolved: 6 },
    { name: "Fri", faults: 5, resolved: 4 },
    { name: "Sat", faults: 3, resolved: 3 },
    { name: "Sun", faults: 1, resolved: 1 },
  ];
}

/**
 * TODO: Replace with actual backend endpoint
 * Needed: GET /dashboard/ticket-trend — returns ticket trend over time
 */
export function getMockTicketTrend(): ChartDataPoint[] {
  return [
    { name: "Mon", opened: 5, closed: 3 },
    { name: "Tue", opened: 7, closed: 6 },
    { name: "Wed", opened: 3, closed: 4 },
    { name: "Thu", opened: 9, closed: 7 },
    { name: "Fri", opened: 6, closed: 5 },
    { name: "Sat", opened: 2, closed: 2 },
    { name: "Sun", opened: 1, closed: 1 },
  ];
}

/**
 * TODO: Replace with actual backend endpoint
 * Needed: GET /dashboard/pole-health — returns healthy vs faulty counts
 */
export function getMockPoleHealth(): ChartDataPoint[] {
  return [
    { name: "Healthy", value: 5 },
    { name: "Faulty", value: 3 },
  ];
}

/**
 * TODO: Replace with actual backend endpoint
 * Needed: GET /dashboard/fault-distribution — returns fault type breakdown
 */
export function getMockFaultDistribution(): ChartDataPoint[] {
  return [
    { name: "Span Fault", value: 12 },
    { name: "DT Fault", value: 5 },
    { name: "Feeder Fault", value: 2 },
  ];
}
