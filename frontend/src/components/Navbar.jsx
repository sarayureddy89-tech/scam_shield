import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import ShieldLogo from "./ShieldLogo.jsx";
import { useAuth } from "../lib/AuthContext.jsx";

const LINKS = [
  { to: "/scan", label: "Scan" },
  { to: "/history", label: "History" },
  { to: "/about", label: "About" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-navy-900/95 backdrop-blur border-b border-white/10">
      <nav className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2.5">
          <ShieldLogo size={30} />
          <span className="font-display font-semibold text-white text-lg">ScamShield</span>
        </NavLink>

        <div className="hidden md:flex items-center gap-1">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? "bg-white/10 text-white" : "text-white/70 hover:text-white hover:bg-white/5"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <button
              onClick={() => { logout(); navigate("/"); }}
              className="text-sm text-white/70 hover:text-white font-medium"
            >
              Sign out
            </button>
          ) : (
            <NavLink to="/login" className="text-sm text-white/70 hover:text-white font-medium">
              Sign in
            </NavLink>
          )}
          <NavLink
            to="/scan"
            className="hidden sm:inline-flex items-center px-4 py-2 rounded-lg bg-safe-500 text-navy-950 text-sm font-semibold hover:bg-safe-600 transition-colors"
          >
            Scan Now
          </NavLink>
        </div>
      </nav>
    </header>
  );
}
