import React, { useState } from "react";
import { AlertTriangle, CheckSquare, Square, ChevronDown, ChevronUp } from "lucide-react";

export function WhyPanel({ why }) {
  return (
    <div className="bg-white rounded-2xl shadow-card p-6 border border-navy-900/5">
      <h3 className="font-display font-semibold text-lg text-navy-900 mb-1">Why?</h3>
      <p className="text-sm text-navy-700/70 mb-4">The evidence that shaped this score.</p>
      <ul className="space-y-3">
        {why.length === 0 && (
          <li className="text-sm text-navy-700/60">No risk indicators found.</li>
        )}
        {why.map((w, i) => (
          <li key={i} className="flex gap-3 items-start rounded-xl bg-risk-100/40 p-3 animate-riseIn" style={{ animationDelay: `${i * 60}ms` }}>
            <AlertTriangle size={18} className="text-risk-600 shrink-0 mt-0.5" strokeWidth={2.25} />
            <div>
              <div className="font-medium text-sm text-navy-900">{w.category}</div>
              <div className="text-sm text-navy-700/80 mt-0.5">{w.detail}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ActionPanel({ actions }) {
  const [checked, setChecked] = useState({});
  const toggle = (i) => setChecked((c) => ({ ...c, [i]: !c[i] }));

  return (
    <div className="bg-white rounded-2xl shadow-card p-6 border border-navy-900/5">
      <h3 className="font-display font-semibold text-lg text-navy-900 mb-1">What to do?</h3>
      <p className="text-sm text-navy-700/70 mb-4">Your next safe actions, in order.</p>
      <ul className="space-y-3">
        {actions.map((a, i) => (
          <li key={i}>
            <button
              onClick={() => toggle(i)}
              className="w-full flex gap-3 items-start rounded-xl bg-safe-100/50 p-3 text-left hover:bg-safe-100 transition-colors animate-riseIn"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {checked[i] ? (
                <CheckSquare size={18} className="text-safe-600 shrink-0 mt-0.5" strokeWidth={2.25} />
              ) : (
                <Square size={18} className="text-safe-600 shrink-0 mt-0.5" strokeWidth={2.25} />
              )}
              <div>
                <div className={`font-medium text-sm text-navy-900 ${checked[i] ? "line-through opacity-60" : ""}`}>{a.action}</div>
                <div className="text-sm text-navy-700/80 mt-0.5">{a.detail}</div>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function TechnicalEvidence({ evidence }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-2xl shadow-card border border-navy-900/5 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-6 py-4 font-display font-medium text-navy-900"
      >
        Show technical evidence ({evidence.length} signal{evidence.length !== 1 ? "s" : ""})
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      {open && (
        <div className="px-6 pb-6 font-mono text-xs overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-navy-700/60 border-b border-navy-900/10">
                <th className="py-2 pr-4">Signal</th>
                <th className="py-2 pr-4">Weight</th>
                <th className="py-2">Detail</th>
              </tr>
            </thead>
            <tbody>
              {evidence.map((e, i) => (
                <tr key={i} className="border-b border-navy-900/5">
                  <td className="py-2 pr-4 whitespace-nowrap">{e.signal}</td>
                  <td className={`py-2 pr-4 font-semibold ${e.weight < 0 ? "text-safe-600" : "text-risk-600"}`}>
                    {e.weight > 0 ? "+" : ""}{e.weight}
                  </td>
                  <td className="py-2 text-navy-700/80 font-body">{e.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
