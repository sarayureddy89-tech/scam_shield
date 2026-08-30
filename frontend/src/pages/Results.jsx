import React, { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { Flag, Loader2, CheckCircle2 } from "lucide-react";
import { api } from "../lib/api.js";
import RiskGauge from "../components/RiskGauge.jsx";
import RiskBadge from "../components/RiskBadge.jsx";
import { WhyPanel, ActionPanel, TechnicalEvidence } from "../components/ExplainPanels.jsx";
import WorkflowDiagram from "../components/WorkflowDiagram.jsx";

export default function Results() {
  const { id } = useParams();
  const location = useLocation();
  const [result, setResult] = useState(location.state?.result || null);
  const [loading, setLoading] = useState(!location.state?.result);
  const [reported, setReported] = useState(false);
  const [reporting, setReporting] = useState(false);

  useEffect(() => {
    if (!result) {
      api.getScan(id).then(setResult).finally(() => setLoading(false));
    }
  }, [id]);

  const handleReport = async () => {
    setReporting(true);
    try {
      await api.report({
        scan_id: result.id,
        pattern_summary: result.why?.[0]?.detail || "User-reported suspicious pattern",
        scan_type: result.scan_type,
        score: result.score,
      });
      setReported(true);
    } finally {
      setReporting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-5 py-24 flex justify-center">
        <Loader2 className="animate-spin text-indigo-500" size={28} />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="max-w-3xl mx-auto px-5 py-24 text-center">
        <p className="text-navy-700/70">We couldn't find that scan result.</p>
        <Link to="/scan" className="text-indigo-500 font-medium mt-2 inline-block">Run a new scan</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-5 py-14">
      <div className="text-xs uppercase tracking-wide font-mono text-navy-700/50 mb-2">{result.scan_type} scan result</div>

      <div className="bg-white rounded-2xl shadow-card border border-navy-900/5 p-8 flex flex-col items-center text-center mb-8">
        <RiskGauge score={result.score} level={result.level} />
        <div className="mt-2">
          <RiskBadge level={result.level} size="lg" />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <WhyPanel why={result.why} />
        <ActionPanel actions={result.what_to_do} />
      </div>

      <div className="mb-6">
        <TechnicalEvidence evidence={result.technical_evidence} />
      </div>

      <div className="mb-10 flex items-center justify-between flex-wrap gap-3 bg-white rounded-2xl shadow-card border border-navy-900/5 p-5">
        <p className="text-sm text-navy-700/70">See this pattern elsewhere? Help protect others by reporting it.</p>
        {reported ? (
          <span className="inline-flex items-center gap-2 text-safe-600 font-medium text-sm">
            <CheckCircle2 size={18} /> Reported — thank you
          </span>
        ) : (
          <button
            onClick={handleReport}
            disabled={reporting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-risk-600 text-white text-sm font-semibold hover:bg-risk-700 transition-colors disabled:opacity-50"
          >
            {reporting ? <Loader2 size={16} className="animate-spin" /> : <Flag size={16} />} Report this scam
          </button>
        )}
      </div>

      <WorkflowDiagram />
    </div>
  );
}
