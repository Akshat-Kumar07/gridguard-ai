"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  AlertTriangle,
  Activity,
  Ticket,
  CalendarClock,
  FlaskConical,
  Settings,
  Zap,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Live Faults", href: "/live-faults", icon: AlertTriangle },
  { label: "Telemetry", href: "/telemetry", icon: Activity },
  { label: "Tickets", href: "/tickets", icon: Ticket },
  { label: "Scheduled Outages", href: "/scheduled-outages", icon: CalendarClock },
  { label: "Fault Simulator", href: "/simulator", icon: FlaskConical },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <Zap size={22} />
        </div>
        <div className="sidebar-brand-text">
          <span className="sidebar-brand-name">GridGuard</span>
          <span className="sidebar-brand-tag">AI</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="sidebar-nav-label">MENU</div>
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-nav-item ${isActive ? "sidebar-nav-item-active" : ""}`}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
              {isActive && <div className="sidebar-nav-active-indicator" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-footer-version">v1.0.0</div>
        <div className="sidebar-footer-label">Smart Grid Platform</div>
      </div>
    </aside>
  );
}
