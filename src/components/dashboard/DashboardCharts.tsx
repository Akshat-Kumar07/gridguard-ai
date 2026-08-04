"use client";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import {
  getMockFaultTrend,
  getMockTicketTrend,
  getMockPoleHealth,
  getMockFaultDistribution,
} from "@/services/dashboardService";

const CHART_COLORS = {
  blue: "#2563EB",
  blueLighter: "#93C5FD",
  emerald: "#10B981",
  emeraldLighter: "#6EE7B7",
  red: "#EF4444",
  amber: "#F59E0B",
  violet: "#8B5CF6",
};

const PIE_COLORS = ["#10B981", "#EF4444"];
const FAULT_DIST_COLORS = ["#2563EB", "#F59E0B", "#EF4444"];

export default function DashboardCharts() {
  const faultTrend = getMockFaultTrend();
  const ticketTrend = getMockTicketTrend();
  const poleHealth = getMockPoleHealth();
  const faultDistribution = getMockFaultDistribution();

  return (
    <div className="charts-grid">
      {/* Fault Trend */}
      <div className="chart-card">
        <div className="chart-card-header">
          <h3 className="chart-card-title">Fault Trend</h3>
          <span className="chart-card-badge">Last 7 Days</span>
        </div>
        <div className="chart-card-body">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={faultTrend}>
              <defs>
                <linearGradient id="faultGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.red} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={CHART_COLORS.red} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="resolvedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.emerald} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={CHART_COLORS.emerald} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  fontSize: 13,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area
                type="monotone"
                dataKey="faults"
                stroke={CHART_COLORS.red}
                fill="url(#faultGradient)"
                strokeWidth={2}
                name="Faults"
              />
              <Area
                type="monotone"
                dataKey="resolved"
                stroke={CHART_COLORS.emerald}
                fill="url(#resolvedGradient)"
                strokeWidth={2}
                name="Resolved"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Ticket Trend */}
      <div className="chart-card">
        <div className="chart-card-header">
          <h3 className="chart-card-title">Ticket Trend</h3>
          <span className="chart-card-badge">Last 7 Days</span>
        </div>
        <div className="chart-card-body">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={ticketTrend} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  fontSize: 13,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="opened" fill={CHART_COLORS.blue} radius={[4, 4, 0, 0]} name="Opened" />
              <Bar dataKey="closed" fill={CHART_COLORS.emeraldLighter} radius={[4, 4, 0, 0]} name="Closed" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Healthy vs Faulty Poles */}
      <div className="chart-card">
        <div className="chart-card-header">
          <h3 className="chart-card-title">Pole Health Status</h3>
          <span className="chart-card-badge">Current</span>
        </div>
        <div className="chart-card-body chart-card-body-center">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={poleHealth}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {poleHealth.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  fontSize: 13,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Fault Distribution */}
      <div className="chart-card">
        <div className="chart-card-header">
          <h3 className="chart-card-title">Fault Distribution</h3>
          <span className="chart-card-badge">All Time</span>
        </div>
        <div className="chart-card-body chart-card-body-center">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={faultDistribution}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {faultDistribution.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={FAULT_DIST_COLORS[index % FAULT_DIST_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  fontSize: 13,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
