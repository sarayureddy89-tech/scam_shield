import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      navigate("/history");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-5 py-20">
      <h1 className="font-display font-semibold text-2xl text-navy-900 mb-6">Sign in</h1>
      <form onSubmit={submit} className="bg-white rounded-2xl shadow-card border border-navy-900/5 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-navy-800 mb-1.5">Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-navy-900/15 p-3 text-sm focus:border-indigo-500 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-navy-800 mb-1.5">Password</label>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-navy-900/15 p-3 text-sm focus:border-indigo-500 outline-none" />
        </div>
        {error && <p className="text-sm text-risk-600">{error}</p>}
        <button disabled={loading} className="w-full py-3 rounded-xl bg-indigo-500 text-white font-display font-semibold disabled:opacity-50">
          {loading ? "Signing in…" : "Sign in"}
        </button>
        <p className="text-sm text-navy-700/70 text-center">
          New here? <Link to="/signup" className="text-indigo-500 font-medium">Create an account</Link>
        </p>
      </form>
    </div>
  );
}
