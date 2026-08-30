import React from "react";
import { Link } from "react-router-dom";
import { MessageSquare, Link2, QrCode, Wallet, ArrowRight, Eye, ShieldCheck } from "lucide-react";
import ShieldLogo from "../components/ShieldLogo.jsx";
import WorkflowDiagram from "../components/WorkflowDiagram.jsx";

const SCAN_TYPES = [
  { icon: MessageSquare, title: "Message / Email", desc: "Paste any SMS or email to check for social-engineering red flags." },
  { icon: Link2, title: "URL", desc: "Paste a link to check domain reputation, structure, and lookalikes." },
  { icon: QrCode, title: "QR Code", desc: "Upload or scan a QR — we decode it and analyze the payload." },
  { icon: Wallet, title: "Payment / UPI", desc: "Check a UPI ID or payment request before you send money." },
];

export default function Landing() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy-900 text-white">
        <div className="absolute inset-0 opacity-[0.07]" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }} />
        <div className="relative max-w-6xl mx-auto px-5 pt-20 pb-24 md:pt-28 md:pb-32">
          <div className="flex items-center gap-3 mb-8">
            <ShieldLogo size={44} />
            <span className="font-display font-semibold text-2xl">ScamShield</span>
          </div>
          <h1 className="font-display font-semibold text-4xl md:text-6xl leading-[1.05] max-w-3xl">
            Don't just say <span className="text-risk-500">SCAM</span>.
            <br />Show the evidence.
          </h1>
          <p className="mt-6 text-lg text-white/70 max-w-xl">
            ScamShield is an explainable digital-safety assistant. Every scan gives you a risk
            score, the exact evidence behind it, and the next safe action — never a bare label.
          </p>
          <div className="mt-10 flex items-center gap-4 flex-wrap">
            <Link to="/scan" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-safe-500 text-navy-950 font-display font-semibold hover:bg-safe-600 transition-colors">
              Scan something now <ArrowRight size={18} />
            </Link>
            <Link to="/about" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-white/20 text-white/90 font-medium hover:bg-white/5 transition-colors">
              How it works
            </Link>
          </div>
          <div className="mt-16 flex items-center gap-8 text-sm font-mono text-white/50 flex-wrap">
            <span className="flex items-center gap-2"><Eye size={16} className="text-indigo-400" /> Detect</span>
            <span className="text-white/20">·</span>
            <span className="flex items-center gap-2"><ShieldCheck size={16} className="text-safe-500" /> Explain</span>
            <span className="text-white/20">·</span>
            <span className="flex items-center gap-2"><Link2 size={16} className="text-risk-500" /> Protect</span>
          </div>
        </div>
      </section>

      {/* Scan types */}
      <section className="max-w-6xl mx-auto px-5 py-20">
        <h2 className="font-display font-semibold text-2xl md:text-3xl text-navy-900 mb-2">One dashboard, four ways scams reach you</h2>
        <p className="text-navy-700/70 mb-10 max-w-2xl">Scams show up as texts, links, QR codes, and payment requests. Scan any of them from the same place.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SCAN_TYPES.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.title} className="bg-white rounded-2xl p-6 shadow-card border border-navy-900/5">
                <div className="w-11 h-11 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-4">
                  <Icon size={20} className="text-indigo-500" />
                </div>
                <h3 className="font-display font-semibold text-navy-900 mb-1">{s.title}</h3>
                <p className="text-sm text-navy-700/70">{s.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Workflow */}
      <section className="max-w-6xl mx-auto px-5 pb-24">
        <WorkflowDiagram />
      </section>
    </div>
  );
}
