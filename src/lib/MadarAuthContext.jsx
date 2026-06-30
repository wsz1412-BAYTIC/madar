import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { madarApi, getToken, clearTokens, setToken, setRefreshToken } from "@/api/madarApi";

const MadarAuthContext = createContext();

export function MadarAuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // On mount, check if a token exists in storage
    const token = getToken();
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  const login = useCallback((responseData) => {
    // Accept various response shapes: { access_token } / { token } / { jwt }
    const token = responseData.access_token || responseData.token || responseData.jwt;
    const refreshToken =
      responseData.refresh_token || responseData.refresh || null;

    if (token) {
      setToken(token);
      if (refreshToken) setRefreshToken(refreshToken);
      setIsAuthenticated(true);
    }
  }, []);

  const logout = useCallback(() => {
    madarApi.logout();
    clearTokens();
    setIsAuthenticated(false);
  }, []);

  return (
    <MadarAuthContext.Provider
      value={{ isAuthenticated, loading, login, logout }}
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