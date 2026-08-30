import React, { useEffect, useState } from "react";
import { Users, Flag } from "lucide-react";
import { api } from "../lib/api.js";

export default function CommunityWidget() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.reports().then(setData).catch(() => setError(true));
  }, []);

  if (error) return null;

  return (
    <div className="bg-white rounded-2xl shadow-card p-6 border border-navy-900/5">
      <div className="flex items-center gap-2 mb-1">
        <Users size={18} className="text-indigo-500" />
        <h3 className="font-display font-semibold text-navy-900">Community Reports</h3>
      </div>
      <p className="text-sm text-navy-700/70 mb-4">
        {data ? `${data.total_reports} scam patterns reported by users like you.` : "Loading recent reports…"}
      </p>
      <ul className="space-y-3">
        {(data?.recent || []).map((r) => (
          <li key={r.id} className="flex gap-3 text-sm border-t border-navy-900/5 pt-3 first:border-0 first:pt-0">
            <Flag size={16} className="text-risk-600 shrink-0 mt-0.5" />
            <div>
              <span className="uppercase text-[10px] font-mono text-navy-700/50">{r.scan_type}</span>
              <p className="text-navy-800">{r.pattern_summary}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
