"use client";

import { useState, useEffect } from "react";
import { useBackendHealth } from "@/hooks/useBackendHealth";
import { Bell, User } from "lucide-react";

export default function Navbar() {
  const { isConnected } = useBackendHealth(10000);
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <header className="navbar">
      <div className="navbar-left">
        <h1 className="navbar-title">Dashboard</h1>
        <span className="navbar-subtitle">Smart Grid Monitoring & Control</span>
      </div>

      <div className="navbar-right">
        {/* Connection Status */}
        <div className="navbar-connection">
          <div
            className={`navbar-connection-dot ${
              isConnected === null
                ? "navbar-connection-checking"
                : isConnected
                  ? "navbar-connection-online"
                  : "navbar-connection-offline"
            }`}
          />
          <span className="navbar-connection-text">
            {isConnected === null
              ? "Checking..."
              : isConnected
                ? "Backend Online"
                : "Backend Offline"}
          </span>
        </div>

        {/* Separator */}
        <div className="navbar-separator" />

        {/* Live Clock */}
        <div className="navbar-clock">
          <div className="navbar-clock-time">{currentTime}</div>
          <div className="navbar-clock-date">{dateStr}</div>
        </div>

        {/* Separator */}
        <div className="navbar-separator" />

        {/* Notifications */}
        <button className="navbar-icon-btn" aria-label="Notifications">
          <Bell size={18} />
          <span className="navbar-notification-badge">3</span>
        </button>

        {/* User Avatar */}
        <div className="navbar-avatar">
          <User size={18} />
        </div>
      </div>
    </header>
  );
}
