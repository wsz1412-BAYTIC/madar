import React, { createContext, useContext, useState, useEffect } from 'react';
import { getToken, getUser, setToken, setUser, logoutUser, api } from '@/lib/api';

const AuthContext = createContext();

export function MadarAuthProvider({ children }) {
  const [user, setUserState] = useState(getUser);
  const [token, setTokenState] = useState(getToken);
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const form=new URLSearchParams();form.append('username',email);form.append('password',password);const data=await api.post('/auth/login',form,{headers:{'Content-Type':'application/x-www-form-urlencoded'}});
      setToken(data.token || data.access_token);
      setUser(data.user || { email });
      setTokenState(data.token || data.access_token);
      setUserState(data.user || { email });
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    logoutUser();
    setUserState(null);
    setTokenState(null);
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useMadarAuth = () => useContext(AuthContext);