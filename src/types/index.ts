// ============================================================
// GridGuard AI — TypeScript Types
// All types derived from backend SQLAlchemy models
// ============================================================

// --- Core Entities ---

export interface Feeder {
  id: number;
  feeder_code: string;
  name: string;
  location: string | null;
}

export interface Transformer {
  id: number;
  transformer_code: string;
  name: string;
  capacity_kva: number | null;
  latitude: number | null;
  longitude: number | null;
  households_served: number | null;
  feeder_id: number;
}

export interface Pole {
  id: number;
  pole_code: string;
  latitude: number | null;
  longitude: number | null;
  device_id: string | null;
  seq_on_line: number;
  pole_type: string | null;
  ward: string | null;
  pincode: string | null;
  is_active: boolean;
  transformer_id: number;
  parent_pole_id: number | null;
}

export interface PoleStatus {
  id: number;
  pole_id: number;
  energized: boolean;
  last_event: string;
  last_seen: string;
}

export interface PoleWithStatus extends Pole {
  status?: PoleStatus;
  transformer_code?: string;
}

// --- Telemetry ---

export type TelemetryEvent =
  | "heartbeat"
  | "power_lost"
  | "power_restored"
  | "boot"
  | "device_failure"
  | "scheduled_outage";

export interface Telemetry {
  id: number;
  pole_id: number;
  device_id: string;
  event: TelemetryEvent;
  energized: boolean;
  ts: string;
  seq: number;
  battery_mv: number;
  rssi: number;
  fw: string;
  received_at: string;
}

export interface TelemetryCreate {
  device_id: string;
  pole_id: string;
  event: TelemetryEvent;
  energized: boolean;
  ts: string;
  seq: number;
  battery_mv: number;
  rssi: number;
  fw: string;
}

// --- Tickets ---

export type TicketStatus =
  | "DETECTED"
  | "ACKNOWLEDGED"
  | "CREW_ASSIGNED"
  | "RESOLVED"
  | "VERIFIED"
  | "CLOSED"
  | "OPEN";

export type TicketPriority = "HIGH" | "MEDIUM" | "LOW" | "CRITICAL";

export interface Ticket {
  id: number;
  pole_id: number;
  title: string;
  description: string | null;
  status: TicketStatus;
  priority: TicketPriority;
  created_at: string;
  closed_at: string | null;
  pole_code?: string;
  location?: string;
}

// --- Scheduled Outages ---

export interface ScheduledOutage {
  id: number;
  outage_id: string;
  scope: "feeder" | "dt";
  target_id: string;
  start: string;
  end: string;
  reason: string;
}

// --- Dashboard ---

export interface DashboardStats {
  totalFeeders: number;
  totalTransformers: number;
  totalPoles: number;
  activeFaults: number;
  openTickets: number;
  scheduledOutages: number;
}

// --- Fault Simulator Request Bodies ---

export interface SpanFaultRequest {
  pole_code: string;
}

export interface DTFaultRequest {
  transformer_code: string;
}

export interface FeederFaultRequest {
  feeder_code: string;
}

export interface NoiseRequest {
  choice: string;
}

export interface RepairRequest {
  transformer_code: string;
}

// --- API Response ---

export interface ApiMessageResponse {
  message: string;
}

// --- Chart Data ---

export interface ChartDataPoint {
  name: string;
  value?: number;
  faults?: number;
  resolved?: number;
  opened?: number;
  closed?: number;
}