import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { ShieldCheck, TrendingUp } from "lucide-react";
import { api } from "../lib/api.js";
import RiskBadge from "../components/RiskBadge.jsx";
import CommunityWidget from "../components/CommunityWidget.jsx";

const TYPE_LABEL = { message: "Message", url: "URL", qr: "QR Code", payment: "Payment" };

export default function History() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.history().then(setData).catch(() => setError(true));
  }, []);

  const chartData = (data?.results || [])
    .slice()
    .reverse()
    .map((r, i) => ({ name: `#${i + 1}`, score: r.score, date: new Date(r.created_at).toLocaleDateString() }));

  return (
    <div className="max-w-5xl mx-auto px-5 py-14">
      <h1 className="font-display font-semibold text-3xl text-navy-900 mb-2">Your history</h1>
      <p className="text-navy-700/70 mb-8">Past scans, your personal risk trend, and scams you've avoided.</p>

      {error && <p className="text-risk-600">Couldn't load history right now.</p>}

      {data && (
        <>
          <div className="grid sm:grid-cols-2 gap-5 mb-8">
            <div className="bg-white rounded-2xl shadow-card border border-navy-900/5 p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-safe-100 flex items-center justify-center">
                <ShieldCheck className="text-safe-600" size={22} />
              </div>
              <div>
                <div className="font-display font-semibold text-2xl text-navy-900">{data.scams_avoided}</div>
                <div className="text-sm text-navy-700/70">Scams avoided</div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-card border border-navy-900/5 p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                <TrendingUp className="text-indigo-500" size={22} />
              </div>
              <div>
                <div className="font-display font-semibold text-2xl text-navy-900">{data.total}</div>
                <div className="text-sm text-navy-700/70">Total scans run</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-card border border-navy-900/5 p-6 mb-8">
            <h3 className="font-display font-semibold text-navy-900 mb-4">Risk score over time</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4E8F2" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#5B6B8C" }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#5B6B8C" }} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#4C5FD5" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white rounded-2xl shadow-card border border-navy-900/5 divide-y divide-navy-900/5">
              {data.results.length === 0 && (
                <p className="p-6 text-sm text-navy-700/60">No scans yet. <Link to="/scan" className="text-indigo-500 font-medium">Run your first scan</Link>.</p>
              )}
              {data.results.map((r) => (
                <Link key={r.id} to={`/results/${r.id}`} className="flex items-center justify-between gap-4 p-4 hover:bg-navy-900/[0.02] transition-colors">
                  <div className="min-w-0">
                    <div className="text-xs font-mono text-navy-700/50 uppercase">{TYPE_LABEL[r.scan_type]}</div>
                    <div className="text-sm text-navy-800 truncate max-w-md">{r.input_summary}</div>
                  </div>
                  <RiskBadge level={r.level} />
                </Link>
              ))}
            </div>
            <CommunityWidget />
          </div>
        </>
      )}
    </div>
  );
}
