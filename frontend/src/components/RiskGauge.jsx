import React from "react";
import { RISK_CONFIG } from "./RiskBadge.jsx";

const COLORS = {
  LOW: "#0E9F6E",
  MEDIUM: "#C2760C",
  HIGH: "#DC2626",
  CRITICAL: "#B91C1C",
};

// Half-circle gauge, 0-100, drawn as an SVG arc with a stroke-dashoffset animation.
export default function RiskGauge({ score, level }) {
  const radius = 90;
  const circumference = Math.PI * radius; // half circle length
  const pct = Math.max(0, Math.min(100, score)) / 100;
  const offset = circumference * (1 - pct);
  const color = COLORS[level] || COLORS.MEDIUM;

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 220 130" className="w-64 h-40">
        <path
          d="M 20 110 A 90 90 0 0 1 200 110"
          fill="none"
          stroke="#E4E8F2"
          strokeWidth="16"
          strokeLinecap="round"
        />
        <path
          d="M 20 110 A 90 90 0 0 1 200 110"
          fill="none"
          stroke={color}
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            "--gauge-start": circumference,
            "--gauge-end": offset,
            transition: "stroke 0.3s ease",
          }}
          className="animate-gauge"
        />
        <text x="110" y="95" textAnchor="middle" className="font-display font-bold" style={{ fontSize: "40px", fill: "#0B1730" }}>
          {score}
        </text>
        <text x="110" y="115" textAnchor="middle" className="font-body" style={{ fontSize: "12px", fill: "#5B6B8C" }}>
          out of 100
        </text>
      </svg>
    </div>
  );
}
