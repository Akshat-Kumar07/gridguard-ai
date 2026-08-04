"use client";

import { useEffect, useRef, useState } from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: "blue" | "emerald" | "red" | "amber" | "violet" | "cyan";
  subtitle?: string;
}

const colorMap = {
  blue: {
    bg: "linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)",
    light: "rgba(37, 99, 235, 0.08)",
    text: "#2563EB",
    iconBg: "rgba(37, 99, 235, 0.12)",
  },
  emerald: {
    bg: "linear-gradient(135deg, #059669 0%, #10B981 100%)",
    light: "rgba(16, 185, 129, 0.08)",
    text: "#059669",
    iconBg: "rgba(16, 185, 129, 0.12)",
  },
  red: {
    bg: "linear-gradient(135deg, #DC2626 0%, #EF4444 100%)",
    light: "rgba(239, 68, 68, 0.08)",
    text: "#DC2626",
    iconBg: "rgba(239, 68, 68, 0.12)",
  },
  amber: {
    bg: "linear-gradient(135deg, #D97706 0%, #F59E0B 100%)",
    light: "rgba(245, 158, 11, 0.08)",
    text: "#D97706",
    iconBg: "rgba(245, 158, 11, 0.12)",
  },
  violet: {
    bg: "linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%)",
    light: "rgba(124, 58, 237, 0.08)",
    text: "#7C3AED",
    iconBg: "rgba(124, 58, 237, 0.12)",
  },
  cyan: {
    bg: "linear-gradient(135deg, #0891B2 0%, #06B6D4 100%)",
    light: "rgba(6, 182, 212, 0.08)",
    text: "#0891B2",
    iconBg: "rgba(6, 182, 212, 0.12)",
  },
};

function useCountUp(target: number, duration: number = 1200) {
  const [count, setCount] = useState(0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [target, duration]);

  return count;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
}: StatCardProps) {
  const animatedValue = useCountUp(value);
  const colors = colorMap[color];

  return (
    <div className="stat-card" style={{ "--stat-accent": colors.text } as React.CSSProperties}>
      <div className="stat-card-header">
        <div>
          <p className="stat-card-title">{title}</p>
          <p className="stat-card-value" style={{ color: colors.text }}>
            {animatedValue.toLocaleString()}
          </p>
          {subtitle && <p className="stat-card-subtitle">{subtitle}</p>}
        </div>
        <div
          className="stat-card-icon"
          style={{ background: colors.iconBg }}
        >
          <Icon size={22} style={{ color: colors.text }} />
        </div>
      </div>
      <div
        className="stat-card-bar"
        style={{ background: colors.bg }}
      />
    </div>
  );
}
