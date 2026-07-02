import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      setAuthError(null);
      const authed = await base44.auth.isAuthenticated();
      if (authed) {
        try {
          const currentUser = await base44.auth.me();
          setUser(currentUser);
          setIsAuthenticated(true);
        } catch (err) {
          if (err?.response?.status === 403 && err?.response?.data?.extra_data?.reason === "user_not_registered") {
            setAuthError({ type: "user_not_registered", message: "User not registered for this app" });
          } else {
            setIsAuthenticated(false);
          }
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const logout = useCallback((shouldRedirect = true) => {
    setUser(null);
    setIsAuthenticated(false);
    if (shouldRedirect) {
      base44.auth.logout(window.location.origin);
    } else {
      base44.auth.logout();
    }
  }, []);

  const navigateToLogin = useCallback(() => {
    base44.auth.redirectToLogin(window.location.pathname + window.location.search);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      loading,
      authError,
      logout,
      navigateToLogin,
      checkAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};