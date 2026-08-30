import React, { createContext, useContext, useState, useCallback } from "react";
import { api } from "./api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const name = localStorage.getItem("scamshield_name");
    const id = localStorage.getItem("scamshield_user_id");
    return id ? { id, name } : null;
  });

  const persist = (token, id, name) => {
    localStorage.setItem("scamshield_token", token);
    localStorage.setItem("scamshield_user_id", id);
    localStorage.setItem("scamshield_name", name || "");
    setUser({ id, name });
  };

  const login = useCallback(async (email, password) => {
    const res = await api.login(email, password);
    persist(res.access_token, res.user_id, res.name);
    return res;
  }, []);

  const signup = useCallback(async (email, password, name) => {
    const res = await api.signup(email, password, name);
    persist(res.access_token, res.user_id, res.name);
    return res;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("scamshield_token");
    localStorage.removeItem("scamshield_user_id");
    localStorage.removeItem("scamshield_name");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
