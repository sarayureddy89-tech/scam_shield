import React from "react";
import { Inbox, ScanSearch, Cpu, Gauge, FileCheck } from "lucide-react";

const STEPS = [
  { icon: Inbox, title: "Input Collection", detail: "Message, URL, QR, or payment request submitted." },
  { icon: ScanSearch, title: "Data Extraction", detail: "URL, sender, text, QR/UPI details pulled out." },
  { icon: Cpu, title: "Risk Analysis Engine", detail: "Risk + Threat + Financial signals run in parallel." },
  { icon: Gauge, title: "Risk Scoring", detail: "Signals fused into one 0–100 score & level." },
  { icon: FileCheck, title: "Explainable Result", detail: "Why + What-to-do shown, evidence included." },
];

export default function WorkflowDiagram() {
  return (
    <div className="bg-navy-900 rounded-2xl p-6 md:p-8 text-white">
      <h3 className="font-display font-semibold text-lg mb-6">System Workflow</h3>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-2">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="relative flex md:flex-col items-center md:items-start gap-3 md:gap-3">
              <div className="shrink-0 w-11 h-11 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center">
                <Icon size={20} className="text-indigo-400" />
              </div>
              <div>
                <div className="text-xs text-indigo-300 font-mono">STEP {i + 1}</div>
                <div className="font-medium text-sm">{s.title}</div>
                <div className="text-xs text-white/60 mt-0.5 max-w-[160px]">{s.detail}</div>
              </div>
              {i < STEPS.length - 1 && (
                <div className="hidden md:block absolute top-5 left-[calc(100%-8px)] w-[calc(100%-24px)] h-px bg-indigo-400/30" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
