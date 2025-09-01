import React, { createContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";

interface AuthContextData {
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextData>({
  token: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("token");
        if (storedToken) {
          setToken(storedToken);
        }
      } catch (error) {
        console.error("Erro ao carregar token:", error);
      }
    };
    loadToken();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const newToken = response.data.access_token;
      setToken(newToken);
      await AsyncStorage.setItem("token", newToken);
    } catch (error: any) {
      console.error("Erro no login:", error.message || error);
      throw new Error("Não foi possível iniciar sessão. Verifica a internet ou o servidor.");
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await api.post("/auth/register", {
        name,
        email,
        password,
      });
      const newToken = response.data.access_token;
      setToken(newToken);
      await AsyncStorage.setItem("token", newToken);
    } catch (error: any) {
      console.error("Erro no registo:", error.message || error);
      throw new Error("Não foi possível registar. Verifica a internet ou o servidor.");
    }
  };

  const logout = async () => {
    try {
      setToken(null);
      await AsyncStorage.removeItem("token");
    } catch (error) {
      console.error("Erro ao terminar sessão:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
