import { createContext, useContext, useState, useEffect } from "react";
import API, { setAccessToken } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const userStr = localStorage.getItem("user");
      const savedToken = localStorage.getItem("token");

      if (userStr && savedToken) {
        setUser(JSON.parse(userStr));
        setAccessToken(savedToken);
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const response = await API.post("/auth/login", { email, password });
    const { token, ...userData } = response.data;
    setAccessToken(token);
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);
  };

  const register = async (name, email, password) => {
    const response = await API.post("/auth/register", {
      name,
      email,
      password,
    });
    const { token, ...userData } = response.data;
    setAccessToken(token);
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);
  };

  const logout = async () => {
    try {
      await API.post("/auth/logout");
    } finally {
      setAccessToken(null);
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
