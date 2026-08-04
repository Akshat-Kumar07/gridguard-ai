"use client";

import { useState } from "react";
import axios from "axios";
import {
  FlaskConical,
  Zap,
  GitBranch,
  Cable,
  Radio,
  Wrench,
  Loader2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import {
  injectSpanFault,
  injectDtFault,
  injectFeederFault,
  repairSpanFault,
  repairDtFault,
  repairFeederFault,
  injectNoise,
} from "@/services/faultService";

/* ────────────────────────────────────────────────────────
   Noise choices from the backend spec
   ──────────────────────────────────────────────────────── */
const NOISE_CHOICES = [
  { value: "1", label: "Duplicate" },
  { value: "2", label: "Out-of-order" },
  { value: "3", label: "Device Failure" },
  { value: "4", label: "Scheduled Outage" },
  { value: "5", label: "Packet Loss" },
  { value: "6", label: "Firmware Silent" },
] as const;

/* ────────────────────────────────────────────────────────
   Card configuration — drives the entire UI
   ──────────────────────────────────────────────────────── */
interface SimCardConfig {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  accentColor: string;
  accentBg: string;
  accentBorder: string;
  accentText: string;
  btnClass: string;
  inputType: "text" | "select";
  inputLabel: string;
  inputPlaceholder: string;
  inputPrefix?: string;
  buttonLabel: string;
}

const CARDS: SimCardConfig[] = [
  {
    id: "span",
    title: "Span Fault",
    description:
      "Inject a fault on a single pole span. This simulates a line break between two consecutive poles.",
    icon: Zap,
    accentColor: "#EF4444",
    accentBg: "bg-red-50",
    accentBorder: "border-red-200",
    accentText: "text-red-600",
    btnClass:
      "bg-red-600 hover:bg-red-700 focus-visible:ring-red-500/30 text-white",
    inputType: "text",
    inputLabel: "Pole Code",
    inputPlaceholder: "e.g., P00001",
    buttonLabel: "Inject Span Fault",
  },
  {
    id: "dt",
    title: "DT Fault",
    description:
      "Inject a fault on a distribution transformer, affecting all poles connected to it.",
    icon: GitBranch,
    accentColor: "#F59E0B",
    accentBg: "bg-amber-50",
    accentBorder: "border-amber-200",
    accentText: "text-amber-600",
    btnClass:
      "bg-amber-600 hover:bg-amber-700 focus-visible:ring-amber-500/30 text-white",
    inputType: "text",
    inputLabel: "Transformer Code",
    inputPlaceholder: "e.g., DT001",
    buttonLabel: "Inject DT Fault",
  },
  {
    id: "feeder",
    title: "Feeder Fault",
    description:
      "Inject a fault on an entire feeder line, impacting all downstream transformers and poles.",
    icon: Cable,
    accentColor: "#8B5CF6",
    accentBg: "bg-violet-50",
    accentBorder: "border-violet-200",
    accentText: "text-violet-600",
    btnClass:
      "bg-violet-600 hover:bg-violet-700 focus-visible:ring-violet-500/30 text-white",
    inputType: "text",
    inputLabel: "Feeder Code",
    inputPlaceholder: "e.g., F001",
    buttonLabel: "Inject Feeder Fault",
  },
  {
    id: "noise",
    title: "Noise Injection",
    description:
      "Simulate telemetry noise scenarios to test the AI engine's filtering and anomaly detection.",
    icon: Radio,
    accentColor: "#0EA5E9",
    accentBg: "bg-sky-50",
    accentBorder: "border-sky-200",
    accentText: "text-sky-600",
    btnClass:
      "bg-sky-600 hover:bg-sky-700 focus-visible:ring-sky-500/30 text-white",
    inputType: "select",
    inputLabel: "Noise Type",
    inputPlaceholder: "Select a noise scenario",
    buttonLabel: "Inject Noise",
  },
  {
  id: "repair-dt",
  title: "DT Repair",
  description: "Restore power to all poles connected to a distribution transformer.",
  icon: Wrench,
  accentColor: "#10B981",
  accentBg: "bg-emerald-50",
  accentBorder: "border-emerald-200",
  accentText: "text-emerald-600",
  btnClass:
    "bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-500/30 text-white",
  inputType: "text",
  inputLabel: "Transformer Code",
  inputPlaceholder: "e.g., DT001",
  buttonLabel: "Repair DT",
  },
  {
  id: "repair-span",
  title: "Span Repair",
  description: "Restore power to a single pole span.",
  icon: Wrench,
  accentColor: "#22C55E",
  accentBg: "bg-green-50",
  accentBorder: "border-green-200",
  accentText: "text-green-600",
  btnClass:
    "bg-green-600 hover:bg-green-700 focus-visible:ring-green-500/30 text-white",
  inputType: "text",
  inputLabel: "Pole Code",
  inputPlaceholder: "e.g., P00001",
  buttonLabel: "Repair Span",
  },
  {
  id: "repair-feeder",
  title: "Feeder Repair",
  description: "Restore power to all poles connected to a feeder.",
  icon: Wrench,
  accentColor: "#14B8A6",
  accentBg: "bg-teal-50",
  accentBorder: "border-teal-200",
  accentText: "text-teal-600",
  btnClass:
    "bg-teal-600 hover:bg-teal-700 focus-visible:ring-teal-500/30 text-white",
  inputType: "text",
  inputLabel: "Feeder Code",
  inputPlaceholder: "e.g., F001",
  buttonLabel: "Repair Feeder",
},
];

/* ────────────────────────────────────────────────────────
   Individual Simulator Card Component
   ──────────────────────────────────────────────────────── */
function SimulatorCard({ config }: { config: SimCardConfig }) {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  const Icon = config.icon;

  const handleSubmit = async () => {
    if (!value.trim()) {
      toast.error("Please provide a value before submitting.");
      return;
    }

    setLoading(true);
    try {
      let response;
      switch (config.id) {
        case "span":
          response = await injectSpanFault({ pole_code: value.trim() });
          break;
        case "dt":
          response = await injectDtFault({ transformer_code: value.trim() });
          break;
        case "feeder":
          response = await injectFeederFault({ feeder_code: value.trim() });
          break;
        case "noise":
          response = await injectNoise({ choice: value });
          break;
        case "repair-dt":
          response = await repairDtFault({
          transformer_code: value.trim(),
      });
        break;

        case "repair-span":
          response = await repairSpanFault({
            pole_code: value.trim(),
          });
          break;

        case "repair-feeder":
          response = await repairFeederFault({
            feeder_code: value.trim(),
          });
          break;
        default:
          throw new Error("Unknown card type");
      }
      toast.success(response.message || "Operation completed successfully.");
      setValue("");
    } catch (err: unknown) {
      let errorMessage = "Something went wrong";
      if (axios.isAxiosError(err)) {
        errorMessage =
          err.response?.data?.detail ||
          err.response?.data?.message ||
          err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${config.accentBorder}`}
    >
      {/* Accent top bar */}
      <div
        className="h-1 w-full"
        style={{ background: config.accentColor }}
      />

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start gap-4 mb-5">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${config.accentBg}`}
          >
            <Icon size={22} style={{ color: config.accentColor }} />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-slate-900 leading-tight">
              {config.title}
            </h3>
            <p className="text-sm text-slate-500 mt-1 leading-relaxed">
              {config.description}
            </p>
          </div>
        </div>

        {/* Input */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
            {config.inputLabel}
          </label>

          {config.inputType === "select" ? (
            <select
              value={value}
              onChange={(e) => setValue(e.target.value)}
              disabled={loading}
              className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-sm text-slate-800 outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 12px center",
              }}
            >
              <option value="" disabled>
                {config.inputPlaceholder}
              </option>
              {NOISE_CHOICES.map((choice) => (
                <option key={choice.value} value={choice.value}>
                  {choice.value}. {choice.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={config.inputPlaceholder}
              disabled={loading}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
              className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          )}
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading || !value.trim()}
          className={`w-full h-10 rounded-lg text-sm font-semibold transition-all duration-200 outline-none focus-visible:ring-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${config.btnClass}`}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Processing…</span>
            </>
          ) : (
            <>
              <Icon size={16} />
              <span>{config.buttonLabel}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   Page Component
   ──────────────────────────────────────────────────────── */
export default function SimulatorPage() {
  return (
    <div className="animate-fade-in-up">
      {/* Page Header */}
      <div className="page-header">
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
            <FlaskConical size={20} className="text-blue-600" />
          </div>
          <div>
            <h2 className="page-title">Fault Simulator</h2>
            <p className="page-subtitle">
              Inject faults and noise scenarios to test the detection engine
            </p>
          </div>
        </div>
      </div>

      {/* Warning Banner */}
      <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 mb-6">
        <AlertTriangle size={18} className="text-amber-600 shrink-0" />
        <p className="text-sm text-amber-800">
          <span className="font-semibold">Caution:</span> These actions will
          inject real faults and telemetry noise into the system. Use
          responsibly in test environments only.
        </p>
      </div>

      {/* Simulator Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 stagger-children">
        {CARDS.map((card) => (
          <SimulatorCard key={card.id} config={card} />
        ))}
      </div>
    </div>
  );
}
