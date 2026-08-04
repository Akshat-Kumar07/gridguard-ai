"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  CalendarClock,
  RefreshCw,
  Search,
  AlertCircle,
  Inbox,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Clock,
  PlayCircle,
  CheckCircle2,
  CalendarRange,
} from "lucide-react";
import { toast } from "sonner";
import { getScheduledOutages } from "@/services/scheduledOutageService";
import type { ScheduledOutage } from "@/types";

/* ────────────────────────────────────────────────────────
   Constants
   ──────────────────────────────────────────────────────── */

const PAGE_SIZE = 10;

type OutageStatus = "UPCOMING" | "ONGOING" | "COMPLETED";

const SCOPE_OPTIONS: { value: string; label: string }[] = [
  { value: "ALL", label: "All Scopes" },
  { value: "feeder", label: "Feeder" },
  { value: "dt", label: "Distribution Transformer" },
];

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "ALL", label: "All Statuses" },
  { value: "UPCOMING", label: "Upcoming" },
  { value: "ONGOING", label: "Ongoing" },
  { value: "COMPLETED", label: "Completed" },
];

/* ────────────────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────────────────── */

function computeStatus(start: string, end: string): OutageStatus {
  const now = new Date();
  const s = new Date(start);
  const e = new Date(end);
  if (now < s) return "UPCOMING";
  if (now >= s && now <= e) return "ONGOING";
  return "COMPLETED";
}

function getStatusBadge(status: OutageStatus): string {
  switch (status) {
    case "UPCOMING":
      return "bg-blue-100 text-blue-700 border border-blue-200";
    case "ONGOING":
      return "bg-orange-100 text-orange-700 border border-orange-200";
    case "COMPLETED":
      return "bg-emerald-100 text-emerald-700 border border-emerald-200";
  }
}

function getScopeBadge(scope: string): string {
  switch (scope) {
    case "feeder":
      return "bg-blue-100 text-blue-700 border border-blue-200";
    case "dt":
      return "bg-purple-100 text-purple-700 border border-purple-200";
    default:
      return "bg-slate-100 text-slate-600 border border-slate-200";
  }
}

function getScopeLabel(scope: string): string {
  switch (scope) {
    case "feeder":
      return "Feeder";
    case "dt":
      return "Distribution Transformer";
    default:
      return scope;
  }
}

function formatDuration(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const diffMs = e.getTime() - s.getTime();
  if (diffMs <= 0) return "—";

  const totalMinutes = Math.round(diffMs / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days} Day${days > 1 ? "s" : ""}`);
  if (hours > 0) parts.push(`${hours} Hour${hours > 1 ? "s" : ""}`);
  if (minutes > 0 && days === 0) parts.push(`${minutes} Min${minutes > 1 ? "s" : ""}`);

  return parts.length > 0 ? parts.join(" ") : "< 1 Min";
}

function formatTimestamp(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
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
    blue: { text: "text-blue-700", iconBg: "bg-blue-100", bar: "bg-blue-500" },
    sky: { text: "text-sky-700", iconBg: "bg-sky-100", bar: "bg-sky-500" },
    orange: { text: "text-orange-700", iconBg: "bg-orange-100", bar: "bg-orange-500" },
    emerald: { text: "text-emerald-700", iconBg: "bg-emerald-100", bar: "bg-emerald-500" },
  };
  const c = colorMap[color] || colorMap.blue;

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

export default function ScheduledOutagesPage() {
  const [outages, setOutages] = useState<ScheduledOutage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [scopeFilter, setScopeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  /* ── Fetch ────────────────────────────────────────── */

  const fetchOutages = useCallback(async (showToast = false) => {
    try {
      setError(null);
      // Wide time window: 1 year back to 1 year forward
      const now = new Date();
      const from = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      const to = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
      const data = await getScheduledOutages(from.toISOString(), to.toISOString());
      setOutages(data);
      if (showToast) toast.success("Scheduled outages refreshed");
    } catch {
      const msg = "Failed to load scheduled outages";
      setError(msg);
      if (showToast) toast.error(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOutages();
  }, [fetchOutages]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOutages(true);
  };

  /* ── Augment with computed status ─────────────────── */

  const augmentedOutages = useMemo(
    () =>
      outages.map((o) => ({
        ...o,
        computedStatus: computeStatus(o.start, o.end),
      })),
    [outages]
  );

  /* ── Computed Stats ───────────────────────────────── */

  const stats = useMemo(() => {
    const total = augmentedOutages.length;
    const upcoming = augmentedOutages.filter((o) => o.computedStatus === "UPCOMING").length;
    const ongoing = augmentedOutages.filter((o) => o.computedStatus === "ONGOING").length;
    const completed = augmentedOutages.filter((o) => o.computedStatus === "COMPLETED").length;
    return { total, upcoming, ongoing, completed };
  }, [augmentedOutages]);

  /* ── Filtering & Search ───────────────────────────── */

  const filteredOutages = useMemo(() => {
    let result = augmentedOutages;

    if (scopeFilter !== "ALL") {
      result = result.filter((o) => o.scope === scopeFilter);
    }

    if (statusFilter !== "ALL") {
      result = result.filter((o) => o.computedStatus === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (o) =>
          o.outage_id.toLowerCase().includes(q) ||
          o.target_id.toLowerCase().includes(q) ||
          o.reason.toLowerCase().includes(q)
      );
    }

    return result;
  }, [augmentedOutages, scopeFilter, statusFilter, searchQuery]);

  /* ── Pagination ───────────────────────────────────── */

  const totalPages = Math.max(1, Math.ceil(filteredOutages.length / PAGE_SIZE));

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, scopeFilter, statusFilter]);

  const paginatedOutages = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredOutages.slice(start, start + PAGE_SIZE);
  }, [filteredOutages, currentPage]);

  /* ── Render ───────────────────────────────────────── */

  return (
    <div className="animate-fade-in-up">
      {/* ─── Page Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
            <CalendarClock size={20} className="text-blue-600" />
          </div>
          <div>
            <h2 className="page-title">Scheduled Outages</h2>
            <p className="page-subtitle">Planned Maintenance Management</p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing || loading}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* ─── Stat Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 stagger-children">
        <StatCard title="Total Outages" value={stats.total} icon={CalendarRange} color="blue" />
        <StatCard title="Upcoming" value={stats.upcoming} icon={Clock} color="sky" />
        <StatCard title="Ongoing" value={stats.ongoing} icon={PlayCircle} color="orange" />
        <StatCard title="Completed" value={stats.completed} icon={CheckCircle2} color="emerald" />
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
            placeholder="Search by Outage ID, Target ID, or Reason…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all duration-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:bg-white focus:shadow-sm hover:border-slate-300"
          />
        </div>

        {/* Scope filter */}
        <select
          value={scopeFilter}
          onChange={(e) => setScopeFilter(e.target.value)}
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-100 cursor-pointer appearance-none min-w-[160px]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 10px center",
            paddingRight: "32px",
          }}
        >
          {SCOPE_OPTIONS.map((o) => (
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
                  "Outage ID",
                  "Scope",
                  "Target ID",
                  "Reason",
                  "Start Time",
                  "End Time",
                  "Duration",
                  "Status",
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
              {!loading && !error && filteredOutages.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                        <Inbox size={24} className="text-slate-400" />
                      </div>
                      <p className="text-sm font-medium text-slate-600">
                        No scheduled outages found
                      </p>
                      <p className="text-xs text-slate-400 max-w-xs">
                        {searchQuery || scopeFilter !== "ALL" || statusFilter !== "ALL"
                          ? "Try adjusting your search or filters."
                          : "No outages have been scheduled yet."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}

              {/* Data rows */}
              {!loading &&
                !error &&
                paginatedOutages.map((outage) => (
                  <tr key={outage.id} className="transition-colors hover:bg-slate-50/80">
                    {/* Outage ID */}
                    <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">
                      {outage.outage_id}
                    </td>

                    {/* Scope Badge */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getScopeBadge(outage.scope)}`}
                      >
                        {getScopeLabel(outage.scope)}
                      </span>
                    </td>

                    {/* Target ID */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                        {outage.target_id}
                      </span>
                    </td>

                    {/* Reason */}
                    <td className="px-4 py-3 text-slate-700 max-w-[200px] truncate">
                      {outage.reason}
                    </td>

                    {/* Start */}
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">
                      {formatTimestamp(outage.start)}
                    </td>

                    {/* End */}
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">
                      {formatTimestamp(outage.end)}
                    </td>

                    {/* Duration */}
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-600 font-medium">
                      {formatDuration(outage.start, outage.end)}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusBadge(outage.computedStatus)}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            outage.computedStatus === "UPCOMING"
                              ? "bg-blue-500"
                              : outage.computedStatus === "ONGOING"
                                ? "bg-orange-500 animate-pulse"
                                : "bg-emerald-500"
                          }`}
                        />
                        {outage.computedStatus === "UPCOMING"
                          ? "Upcoming"
                          : outage.computedStatus === "ONGOING"
                            ? "Ongoing"
                            : "Completed"}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* ─── Pagination Footer ─── */}
        {!loading && !error && filteredOutages.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/50 px-4 py-3">
            <p className="text-xs text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-700">
                {(currentPage - 1) * PAGE_SIZE + 1}
              </span>
              –
              <span className="font-semibold text-slate-700">
                {Math.min(currentPage * PAGE_SIZE, filteredOutages.length)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-700">
                {filteredOutages.length}
              </span>{" "}
              outages
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

      {/* Refreshing indicator */}
      {refreshing && !loading && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm text-white shadow-lg">
          <Loader2 size={16} className="animate-spin" />
          Refreshing…
        </div>
      )}
    </div>
  );
}
