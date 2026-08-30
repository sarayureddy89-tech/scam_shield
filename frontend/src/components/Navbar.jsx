import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
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
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 bg-navy-900/95 backdrop-blur border-b border-white/10">
      <nav className="max-w-6xl mx-auto px-5 min-h-16 flex items-center justify-between">

        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2.5" onClick={closeMenu}>
          <ShieldLogo size={30} />
          <span className="font-display font-semibold text-white text-lg">
            ScamShield
          </span>
        </NavLink>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        {/* Desktop Right Side */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <button
              onClick={handleLogout}
              className="text-sm text-white/70 hover:text-white font-medium"
            >
              Sign out
            </button>
          ) : (
            <NavLink
              to="/login"
              className="text-sm text-white/70 hover:text-white font-medium"
            >
              Sign in
            </NavLink>
          )}

          <NavLink
            to="/scan"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-safe-500 text-navy-950 text-sm font-semibold hover:bg-safe-600 transition-colors"
          >
            Scan Now
          </NavLink>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 rounded-lg text-white hover:bg-white/10"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Navigation */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/10 px-5 py-4 space-y-2">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={closeMenu}
              className={({ isActive }) =>
                `block px-4 py-3 rounded-lg text-sm font-medium ${
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}

          {user ? (
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/5"
            >
              Sign out
            </button>
          ) : (
            <NavLink
              to="/login"
              onClick={closeMenu}
              className="block px-4 py-3 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/5"
            >
              Sign in
            </NavLink>
          )}

          <NavLink
            to="/scan"
            onClick={closeMenu}
            className="block text-center px-4 py-3 rounded-lg bg-safe-500 text-navy-950 text-sm font-semibold hover:bg-safe-600 transition-colors"
          >
            Scan Now
          </NavLink>
        </div>
      )}
    </header>
  );
}
