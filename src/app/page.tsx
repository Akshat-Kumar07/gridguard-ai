"use client";

import {
  Zap,
  GitBranch,
  Landmark,
  AlertTriangle,
  Ticket,
  CalendarClock,
} from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import DashboardCharts from "@/components/dashboard/DashboardCharts";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { stats, loading, error, refetch } = useDashboardStats();

  return (
    <div className="animate-fade-in-up">
      {/* Page Header */}
      <div className="page-header">
        <h2 className="page-title">Dashboard Overview</h2>
        <p className="page-subtitle">
          Real-time monitoring of your smart grid infrastructure
        </p>
      </div>

      {/* Stat Cards */}
      {loading ? (
        <div className="stats-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[130px] rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <div className="stats-grid">
          <div className="stat-card" style={{ gridColumn: "1 / -1", padding: 24, textAlign: "center" }}>
            <p style={{ color: "var(--danger)", marginBottom: 12 }}>
              Failed to load dashboard stats
            </p>
            <button
              onClick={refetch}
              className="retry-btn"
              style={{
                padding: "8px 20px",
                borderRadius: 8,
                background: "var(--primary)",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Retry
            </button>
          </div>
        </div>
      ) : stats ? (
        <div className="stats-grid stagger-children">
          <StatCard
            title="Total Feeders"
            value={stats.totalFeeders}
            icon={Zap}
            color="blue"
            subtitle="Power distribution lines"
          />
          <StatCard
            title="Total Transformers"
            value={stats.totalTransformers}
            icon={GitBranch}
            color="cyan"
            subtitle="Distribution transformers"
          />
          <StatCard
            title="Total Poles"
            value={stats.totalPoles}
            icon={Landmark}
            color="emerald"
            subtitle="Monitored poles"
          />
          <StatCard
            title="Active Faults"
            value={stats.activeFaults}
            icon={AlertTriangle}
            color="red"
            subtitle="Require attention"
          />
          <StatCard
            title="Open Tickets"
            value={stats.openTickets}
            icon={Ticket}
            color="amber"
            subtitle="Pending resolution"
          />
          <StatCard
            title="Scheduled Outages"
            value={stats.scheduledOutages}
            icon={CalendarClock}
            color="violet"
            subtitle="Planned maintenance"
          />
        </div>
      ) : null}

      {/* Charts */}
      <DashboardCharts />
    </div>
  );
}
