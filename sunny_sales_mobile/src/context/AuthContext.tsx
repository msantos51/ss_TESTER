import React, { createContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";

/**
 * Estrutura de dados para guardar informações do vendedor autenticado.
 */
interface Vendor {
  id: number;
  name: string;
  email: string;
  product: string;
  profile_photo: string;
}

/**
 * Dados expostos pelo contexto de autenticação.
 */
interface AuthContextData {
  token: string | null;
  vendor: Vendor | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    product: string,
    profilePhoto: string
  ) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextData>({
  token: null,
  vendor: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

/**
 * Componente que fornece o contexto de autenticação à aplicação.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  // Estado que guarda o token JWT
  const [token, setToken] = useState<string | null>(null);
  // Estado que guarda os dados do vendedor autenticado
  const [vendor, setVendor] = useState<Vendor | null>(null);

  // Carrega o token armazenado ao iniciar a aplicação
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

  /**
   * Executa o processo de login junto do backend.
   */
  const login = async (email: string, password: string) => {
    try {
      // Primeiro, obter o token JWT
      const tokenRes = await api.post("/token", { email, password });
      const newToken = tokenRes.data.access_token;
      setToken(newToken);
      await AsyncStorage.setItem("token", newToken);

      // Em seguida, obter os dados do vendedor
      const userRes = await api.post("/login", { email, password });
      setVendor(userRes.data);
    } catch (error: any) {
      console.error("Erro no login:", error.message || error);
      throw new Error(
        "Não foi possível iniciar sessão. Verifica a internet ou o servidor."
      );
    }
  };

  /**
   * Regista um novo vendedor e efetua login automático.
   */
  const register = async (
    name: string,
    email: string,
    password: string,
    product: string,
    profilePhoto: string
  ) => {
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("product", product);
      formData.append("profile_photo", {
        uri: profilePhoto,
        name: "profile.jpg",
        type: "image/jpeg",
      } as any);

      await api.post("/vendors/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Após registo, efetuar login para obter token e dados do vendedor
      await login(email, password);
    } catch (error: any) {
      console.error("Erro no registo:", error.message || error);
      throw new Error(
        "Não foi possível registar. Verifica a internet ou o servidor."
      );
    }
  };

  /**
   * Termina a sessão do utilizador, removendo o token guardado.
   */
  const logout = async () => {
    try {
      setToken(null);
      setVendor(null);
      await AsyncStorage.removeItem("token");
    } catch (error) {
      console.error("Erro ao terminar sessão:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ token, vendor, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
