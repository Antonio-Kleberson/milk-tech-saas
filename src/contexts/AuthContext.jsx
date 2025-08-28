import React, { createContext, useContext, useState, useEffect } from "react";
import { auth } from "@/lib/auth";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = auth.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { user, error } = await auth.login(email, password);
    if (user) {
      setUser(user);
    }
    return { user, error };
  };

  const register = async (userData) => {
    const { user, error } = await auth.register(userData);
    if (user) {
      setUser(user);
    }
    return { user, error };
  };

  const logout = () => {
    auth.logout();
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
