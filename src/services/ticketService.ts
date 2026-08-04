import api from "@/lib/axios";
import { Ticket, ApiMessageResponse } from "@/types";

/**
 * Ticket Service
 * PATCH endpoints use existing backend APIs
 * GET tickets uses mock data (no backend endpoint exists yet)
 */

/** PATCH /tickets/{id}/acknowledge — existing endpoint */
export async function acknowledgeTicket(
  ticketId: number
): Promise<{ message: string; ticket: Ticket }> {
  const response = await api.patch(`/tickets/${ticketId}/acknowledge`);
  return response.data;
}

/** PATCH /tickets/{id}/assign — existing endpoint */
export async function assignCrew(
  ticketId: number
): Promise<{ message: string; ticket: Ticket }> {
  const response = await api.patch(`/tickets/${ticketId}/assign`);
  return response.data;
}

/** PATCH /tickets/{id}/resolve — existing endpoint */
export async function resolveTicket(
  ticketId: number
): Promise<{ message: string; ticket: Ticket }> {
  const response = await api.patch(`/tickets/${ticketId}/resolve`);
  return response.data;
}

/**
 * TODO: Replace with actual backend endpoint when available
 * Needed: GET /tickets — returns list of all tickets with pole info
 * Currently returns realistic mock data based on backend Ticket model
 */
export async function getTickets(): Promise<Ticket[]> {
  // Try real API first if it exists, fall back to mock
  try {
    const response = await api.get<Ticket[]>("/tickets");
    return response.data;
  } catch {
    return getMockTickets();
  }
}

function getMockTickets(): Ticket[] {
  return [
    {
      id: 1,
      pole_id: 3,
      title: "Power Outage",
      description: "Power lost detected at P003",
      status: "DETECTED",
      priority: "HIGH",
      created_at: "2026-08-03T10:30:00Z",
      closed_at: null,
      pole_code: "P003",
    },
    {
      id: 2,
      pole_id: 5,
      title: "Power Outage",
      description: "Power lost detected at P005",
      status: "ACKNOWLEDGED",
      priority: "HIGH",
      created_at: "2026-08-03T09:15:00Z",
      closed_at: null,
      pole_code: "P005",
    },
    {
      id: 3,
      pole_id: 7,
      title: "Power Outage",
      description: "Power lost detected at P007",
      status: "CREW_ASSIGNED",
      priority: "CRITICAL",
      created_at: "2026-08-03T08:00:00Z",
      closed_at: null,
      pole_code: "P007",
    },
    {
      id: 4,
      pole_id: 1,
      title: "Power Outage",
      description: "Power lost detected at P001",
      status: "RESOLVED",
      priority: "MEDIUM",
      created_at: "2026-08-02T14:00:00Z",
      closed_at: "2026-08-02T16:30:00Z",
      pole_code: "P001",
    },
    {
      id: 5,
      pole_id: 6,
      title: "Power Outage",
      description: "Power lost detected at P006",
      status: "CLOSED",
      priority: "LOW",
      created_at: "2026-08-01T11:00:00Z",
      closed_at: "2026-08-01T13:00:00Z",
      pole_code: "P006",
    },
  ];
}
