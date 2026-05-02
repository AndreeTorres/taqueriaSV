import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api/client";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      const token = localStorage.getItem("inventory_token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await api.get("/auth/me");
        setUser(data.user);
      } catch (_error) {
        localStorage.removeItem("inventory_token");
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const login = async (credentials) => {
    const data = await api.post("/auth/login", credentials);
    localStorage.setItem("inventory_token", data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem("inventory_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
