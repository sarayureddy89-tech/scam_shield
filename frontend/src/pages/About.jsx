import React from "react";
import { ShieldCheck, Eye, Lock } from "lucide-react";
import WorkflowDiagram from "../components/WorkflowDiagram.jsx";

const PRINCIPLES = [
  { icon: Eye, title: "Detect", desc: "Four parallel signal groups — Risk, Threat, and Financial — scan every input for known scam patterns." },
  { icon: ShieldCheck, title: "Explain", desc: "Every score is auditable: you can always see exactly which signals contributed and how much." },
  { icon: Lock, title: "Protect", desc: "Results end in a concrete next safe action, not just a label — because knowing isn't the same as being safe." },
];

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-5 py-14">
      <h1 className="font-display font-semibold text-3xl text-navy-900 mb-2">About ScamShield</h1>
      <p className="text-navy-700/70 mb-10 max-w-2xl">
        ScamShield never just says "SCAM." Every scan produces a risk score, the evidence behind
        it, and the next safe action — because a bare label doesn't help anyone make a good decision.
      </p>

      <div className="grid sm:grid-cols-3 gap-5 mb-10">
        {PRINCIPLES.map((p) => {
          const Icon = p.icon;
          return (
            <div key={p.title} className="bg-white rounded-2xl shadow-card border border-navy-900/5 p-6">
              <Icon size={22} className="text-indigo-500 mb-3" />
              <h3 className="font-display font-semibold text-navy-900 mb-1">{p.title}</h3>
              <p className="text-sm text-navy-700/70">{p.desc}</p>
            </div>
          );
        })}
      </div>

      <div className="mb-10">
        <WorkflowDiagram />
      </div>

      <div className="bg-navy-900 text-white rounded-2xl p-8 text-center">
        <p className="font-display font-semibold text-lg mb-1">Team Brogrammers</p>
        <p className="text-white/60 text-sm">Smart India Hackathon 2026</p>
        <p className="text-white/60 text-sm mt-1">
          Problem Statement: Personal Digital Safety &amp; Scam Prevention Assistant
        </p>
        <p className="text-white/60 text-sm">Theme: Cybersecurity &amp; Digital Safety</p>
      </div>
    </div>
  );
}
