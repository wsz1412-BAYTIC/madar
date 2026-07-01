import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { madarApi, getToken, clearTokens, setToken, setRefreshToken } from "@/api/madarApi";

const MadarAuthContext = createContext();

export function MadarAuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // On mount, check if a token exists in storage
    const token = getToken();
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const form = new URLSearchParams();
    form.append('username', email);
    form.append('password', password);
    const data = await fetch('https://aimadar.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form
    });
    const json = await data.json();
    if (!data.ok) throw new Error(json.detail || 'Login failed');
    setToken(json.access_token);
    setUser({ email, name: json.name, plan: json.plan, id: json.subscriber_id });
    setIsAuthenticated(true);
    if (window.location.pathname !== '/dashboard') {
      window.location.href = '/dashboard';
    }
    return json;
  }, []);

  const logout = useCallback(() => {
    madarApi.logout();
    clearTokens();
    setIsAuthenticated(false);
  }, []);

  return (
    <MadarAuthContext.Provider
      value={{ isAuthenticated, loading, login, logout, user }}
    >
      {children}
    </MadarAuthContext.Provider>
  );
}

export function useMadarAuth() {
  const context = useContext(MadarAuthContext);
  if (!context) {
    throw new Error("useMadarAuth must be used within a MadarAuthProvider");
  }
  return context;
}

export default MadarAuthContext;