import React from "react";
import { ShieldCheck, ShieldAlert, ShieldX, OctagonAlert } from "lucide-react";

const CONFIG = {
  LOW: { icon: ShieldCheck, bg: "bg-safe-100", text: "text-safe-600", ring: "ring-safe-600/30", label: "LOW RISK" },
  MEDIUM: { icon: ShieldAlert, bg: "bg-warn-100", text: "text-warn-600", ring: "ring-warn-600/30", label: "MEDIUM RISK" },
  HIGH: { icon: ShieldX, bg: "bg-risk-100", text: "text-risk-600", ring: "ring-risk-600/30", label: "HIGH RISK" },
  CRITICAL: { icon: OctagonAlert, bg: "bg-risk-100", text: "text-risk-700", ring: "ring-risk-700/40", label: "CRITICAL RISK" },
};

export default function RiskBadge({ level, size = "md" }) {
  const cfg = CONFIG[level] || CONFIG.MEDIUM;
  const Icon = cfg.icon;
  const pad = size === "lg" ? "px-4 py-2 text-base" : "px-3 py-1 text-sm";
  return (
    <span className={`inline-flex items-center gap-2 rounded-full ${pad} font-display font-semibold ${cfg.bg} ${cfg.text} ring-1 ${cfg.ring}`}>
      <Icon size={size === "lg" ? 20 : 16} strokeWidth={2.25} />
      {cfg.label}
    </span>
  );
}

export { CONFIG as RISK_CONFIG };
