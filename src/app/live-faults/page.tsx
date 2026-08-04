"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  AlertTriangle,
  RefreshCw,
  Search,
  AlertCircle,
  Inbox,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Zap,
  GitBranch,
  Radio,
} from "lucide-react";
import { toast } from "sonner";
import { getTickets } from "@/services/ticketService";
import { getTelemetryRecords } from "@/services/telemetryService";
import type { Ticket, Telemetry, TicketStatus, TicketPriority } from "@/types";

/* ────────────────────────────────────────────────────────
   Constants
   ──────────────────────────────────────────────────────── */

const PAGE_SIZE = 10;
const AUTO_REFRESH_MS = 5000;

const ACTIVE_STATUSES: TicketStatus[] = [
  "OPEN",
  "DETECTED",
  "ACKNOWLEDGED",
  "CREW_ASSIGNED",
];

const PRIORITY_OPTIONS: { value: string; label: string }[] = [
  { value: "ALL", label: "All Priorities" },
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "CRITICAL", label: "Critical" },
];

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "ALL", label: "All Active" },
  { value: "OPEN", label: "Open" },
  { value: "DETECTED", label: "Detected" },
  { value: "ACKNOWLEDGED", label: "Acknowledged" },
  { value: "CREW_ASSIGNED", label: "Crew Assigned" },
];

/* ────────────────────────────────────────────────────────
   Merged type for display
   ──────────────────────────────────────────────────────── */

interface LiveFault extends Ticket {
  lastTelemetryEvent: string | null;
  currentPowerStatus: boolean | null;
}

/* ────────────────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────────────────── */

function getPriorityBadge(priority: TicketPriority): string {
  switch (priority) {
    case "CRITICAL":
      return "bg-red-100 text-red-700 border border-red-200";
    case "HIGH":
      return "bg-orange-100 text-orange-700 border border-orange-200";
    case "MEDIUM":
      return "bg-blue-100 text-blue-700 border border-blue-200";
    case "LOW":
      return "bg-slate-100 text-slate-600 border border-slate-200";
    default:
      return "bg-slate-100 text-slate-600 border border-slate-200";
  }
}

function getStatusBadge(status: TicketStatus): string {
  switch (status) {
    case "OPEN":
    case "DETECTED":
      return "bg-red-100 text-red-700 border border-red-200";
    case "ACKNOWLEDGED":
      return "bg-amber-100 text-amber-700 border border-amber-200";
    case "CREW_ASSIGNED":
      return "bg-blue-100 text-blue-700 border border-blue-200";
    default:
      return "bg-slate-100 text-slate-600 border border-slate-200";
  }
}

function formatTimestamp(ts: string | null): string {
  if (!ts) return "—";
  const d = new Date(ts);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatEventLabel(event: string): string {
  return event
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/* ────────────────────────────────────────────────────────
   Stat Card
   ──────────────────────────────────────────────────────── */

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
}) {
  const colorMap: Record<string, { text: string; iconBg: string; bar: string }> = {
    red: { text: "text-red-700", iconBg: "bg-red-100", bar: "bg-red-500" },
    amber: { text: "text-amber-700", iconBg: "bg-amber-100", bar: "bg-amber-500" },
    blue: { text: "text-blue-700", iconBg: "bg-blue-100", bar: "bg-blue-500" },
    purple: { text: "text-purple-700", iconBg: "bg-purple-100", bar: "bg-purple-500" },
  };
  const c = colorMap[color] || colorMap.red;

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 min-h-[130px] flex flex-col">
      <div className="pt-6 px-5 pb-5 flex-1 flex items-center">
        <div className="flex items-center justify-between w-full">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 leading-snug break-words">
              {title}
            </p>
            <p className={`text-3xl font-extrabold mt-1 tracking-tight ${c.text}`}>
              {value}
            </p>
          </div>
          <div className={`flex h-11 w-11 items-center justify-center rounded-lg shrink-0 ml-3 ${c.iconBg}`}>
            <Icon size={20} className={c.text} />
          </div>
        </div>
      </div>
      <div className={`h-1 w-full ${c.bar}`} />
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   Skeleton Rows
   ──────────────────────────────────────────────────────── */

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          {Array.from({ length: 8 }).map((_, j) => (
            <td key={j} className="px-4 py-3">
              <div className="h-4 rounded bg-slate-200" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

/* ────────────────────────────────────────────────────────
   Page Component
   ──────────────────────────────────────────────────────── */

export default function LiveFaultsPage() {
  const [liveFaults, setLiveFaults] = useState<LiveFault[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Auto-refresh ref
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ── Fetch & Merge ────────────────────────────────── */

  const fetchLiveFaults = useCallback(async (showToast = false) => {
    try {
      setError(null);

      // Fetch tickets and telemetry in parallel
      const [allTickets, allTelemetry] = await Promise.all([
        getTickets(),
        getTelemetryRecords(),
      ]);

      // Filter to only active tickets
      const activeTickets = allTickets.filter((t) =>
        ACTIVE_STATUSES.includes(t.status)
      );

      // Build a map of latest telemetry per pole_id
      const telemetryMap = new Map<number, Telemetry>();
      for (const tel of allTelemetry) {
        const existing = telemetryMap.get(tel.pole_id);
        if (!existing || new Date(tel.ts) > new Date(existing.ts)) {
          telemetryMap.set(tel.pole_id, tel);
        }
      }

      // Merge ticket data with latest telemetry
      const merged: LiveFault[] = activeTickets.map((ticket) => {
        const latestTel = telemetryMap.get(ticket.pole_id);
        return {
          ...ticket,
          lastTelemetryEvent: latestTel ? latestTel.event : null,
          currentPowerStatus: latestTel ? latestTel.energized : null,
        };
      });

      setLiveFaults(merged);
      if (showToast) toast.success("Live faults refreshed");
    } catch {
      const msg = "Failed to load live fault data";
      setError(msg);
      if (showToast) toast.error(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchLiveFaults();
  }, [fetchLiveFaults]);

  // Auto-refresh every 5s
  useEffect(() => {
    if (autoRefresh) {
      timerRef.current = setInterval(() => {
        fetchLiveFaults(false);
      }, AUTO_REFRESH_MS);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoRefresh, fetchLiveFaults]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchLiveFaults(true);
  };

  /* ── Computed Stats ───────────────────────────────── */

  const stats = useMemo(() => {
    const active = liveFaults.length;
    const critical = liveFaults.filter((f) => f.priority === "CRITICAL").length;
    const affectedPoles = new Set(liveFaults.map((f) => f.pole_id)).size;
    const affectedTransformers = new Set(
      liveFaults
        .map((f) => f.pole_code?.replace(/\d+$/, ""))
        .filter(Boolean)
    ).size;
    return { active, critical, affectedPoles, affectedTransformers };
  }, [liveFaults]);

  /* ── Filtering & Search ───────────────────────────── */

  const filteredFaults = useMemo(() => {
    let result = liveFaults;

    if (priorityFilter !== "ALL") {
      result = result.filter((f) => f.priority === priorityFilter);
    }

    if (statusFilter !== "ALL") {
      result = result.filter((f) => f.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (f) =>
          String(f.id).includes(q) ||
          (f.pole_code && f.pole_code.toLowerCase().includes(q)) ||
          f.title.toLowerCase().includes(q)
      );
    }

    return result;
  }, [liveFaults, priorityFilter, statusFilter, searchQuery]);

  /* ── Pagination ───────────────────────────────────── */

  const totalPages = Math.max(1, Math.ceil(filteredFaults.length / PAGE_SIZE));

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, priorityFilter, statusFilter]);

  const paginatedFaults = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredFaults.slice(start, start + PAGE_SIZE);
  }, [filteredFaults, currentPage]);

  /* ── Render ───────────────────────────────────────── */

  return (
    <div className="animate-fade-in-up">
      {/* ─── Page Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
            <AlertTriangle size={20} className="text-red-600" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="page-title">Live Faults</h2>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700 border border-red-200">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                LIVE
              </span>
            </div>
            <p className="page-subtitle">Real-Time Grid Fault Monitoring</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Auto-refresh toggle */}
          <button
            onClick={() => setAutoRefresh((v) => !v)}
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-all ${
              autoRefresh
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-white text-slate-500"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                autoRefresh ? "bg-emerald-500 animate-pulse" : "bg-slate-300"
              }`}
            />
            Auto {autoRefresh ? "ON" : "OFF"}
          </button>

          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* ─── Stat Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 stagger-children">
        <StatCard title="Active Faults" value={stats.active} icon={AlertTriangle} color="red" />
        <StatCard title="Critical Faults" value={stats.critical} icon={ShieldAlert} color="amber" />
        <StatCard title="Affected Poles" value={stats.affectedPoles} icon={Zap} color="blue" />
        <StatCard
          title="Affected Transformers"
          value={stats.affectedTransformers}
          icon={GitBranch}
          color="purple"
        />
      </div>

      {/* ─── Search & Filters ─── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 mb-5">
        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search by Ticket ID, Pole Code, or Title…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all duration-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:bg-white focus:shadow-sm hover:border-slate-300"
          />
        </div>

        {/* Priority filter */}
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-100 cursor-pointer appearance-none min-w-[160px]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 10px center",
            paddingRight: "32px",
          }}
        >
          {PRIORITY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-100 cursor-pointer appearance-none min-w-[160px]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 10px center",
            paddingRight: "32px",
          }}
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* ─── Table Card ─── */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-50 border-b border-slate-200">
                {[
                  "Ticket ID",
                  "Pole Code",
                  "Fault Title",
                  "Priority",
                  "Status",
                  "Created",
                  "Last Telemetry",
                  "Power Status",
                ].map((col) => (
                  <th
                    key={col}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {/* Loading */}
              {loading && <TableSkeleton />}

              {/* Error */}
              {!loading && error && (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                        <AlertCircle size={24} className="text-red-500" />
                      </div>
                      <p className="text-sm font-medium text-slate-700">{error}</p>
                      <button
                        onClick={handleRefresh}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                      >
                        <RefreshCw size={14} />
                        Retry
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {/* Empty */}
              {!loading && !error && filteredFaults.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
                        <Inbox size={24} className="text-emerald-500" />
                      </div>
                      <p className="text-sm font-medium text-slate-600">
                        No active faults detected
                      </p>
                      <p className="text-xs text-slate-400 max-w-xs">
                        {searchQuery || priorityFilter !== "ALL" || statusFilter !== "ALL"
                          ? "Try adjusting your search or filters."
                          : "The grid is operating normally. All systems are healthy."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}

              {/* Data rows */}
              {!loading &&
                !error &&
                paginatedFaults.map((fault) => (
                  <tr key={fault.id} className="transition-colors hover:bg-slate-50/80">
                    {/* Ticket ID */}
                    <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">
                      #{fault.id}
                    </td>

                    {/* Pole Code */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                        {fault.pole_code || `P-${fault.pole_id}`}
                      </span>
                    </td>

                    {/* Fault Title */}
                    <td className="px-4 py-3 text-slate-700 max-w-[200px] truncate">
                      {fault.title}
                    </td>

                    {/* Priority */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getPriorityBadge(fault.priority)}`}
                      >
                        {fault.priority}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusBadge(fault.status)}`}
                      >
                        {fault.status.replace("_", " ")}
                      </span>
                    </td>

                    {/* Created Time */}
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">
                      {formatTimestamp(fault.created_at)}
                    </td>

                    {/* Last Telemetry Event */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {fault.lastTelemetryEvent ? (
                        <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                          <Radio size={12} className="text-slate-400" />
                          {formatEventLabel(fault.lastTelemetryEvent)}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">No data</span>
                      )}
                    </td>

                    {/* Power Status */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {fault.currentPowerStatus !== null ? (
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            fault.currentPowerStatus
                              ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                              : "bg-red-100 text-red-700 border border-red-200"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              fault.currentPowerStatus
                                ? "bg-emerald-500"
                                : "bg-red-500 animate-pulse"
                            }`}
                          />
                          {fault.currentPowerStatus ? "Energized" : "De-energized"}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Unknown</span>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* ─── Pagination Footer ─── */}
        {!loading && !error && filteredFaults.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/50 px-4 py-3">
            <p className="text-xs text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-700">
                {(currentPage - 1) * PAGE_SIZE + 1}
              </span>
              –
              <span className="font-semibold text-slate-700">
                {Math.min(currentPage * PAGE_SIZE, filteredFaults.length)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-700">
                {filteredFaults.length}
              </span>{" "}
              active faults
            </p>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  if (totalPages <= 7) return true;
                  if (page === 1 || page === totalPages) return true;
                  if (Math.abs(page - currentPage) <= 1) return true;
                  return false;
                })
                .reduce<(number | "ellipsis")[]>((acc, page, idx, arr) => {
                  if (idx > 0 && page - (arr[idx - 1] as number) > 1) {
                    acc.push("ellipsis");
                  }
                  acc.push(page);
                  return acc;
                }, [])
                .map((item, idx) =>
                  item === "ellipsis" ? (
                    <span key={`ellipsis-${idx}`} className="px-1 text-xs text-slate-400">
                      …
                    </span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setCurrentPage(item)}
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition ${
                        currentPage === item
                          ? "bg-blue-600 text-white shadow-sm"
                          : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Auto-refresh indicator */}
      {autoRefresh && !loading && (
        <div className="flex justify-end mt-4">
          <div className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            Live monitoring · 5s refresh
          </div>
        </div>
      )}

      {/* Refreshing overlay */}
      {refreshing && !loading && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm text-white shadow-lg">
          <Loader2 size={16} className="animate-spin" />
          Refreshing…
        </div>
      )}
    </div>
  );
}
