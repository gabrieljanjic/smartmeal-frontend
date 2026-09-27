import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import axios from "axios";
import type { User, AuthContextType } from "./types/types";

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/auth/me`,
        {
          withCredentials: true,
        },
      );
      if (res.status === 200) {
        setIsAuthenticated(true);
        setUser({
          name: res.data.name,
          role: res.data.role,
        });
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch {
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const logout = async () => {
    await axios.post(
      `${import.meta.env.VITE_API_URL}/api/auth/logout`,
      {},
      {
        withCredentials: true,
      },
    );

    setUser(null);
    setIsAuthenticated(false);
  };

  const value: AuthContextType = {
    isAuthenticated,
    setIsAuthenticated,
    user,
    loading,
    username: user?.name ?? null,
    role: user?.role ?? null,
    refreshAuth: checkAuth,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
