import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

/**
 * Interface que define os dados e funções expostos pelo contexto de autenticação.
 */
interface AuthContextData {
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

/**
 * Criação do contexto com valores padrão.
 */
export const AuthContext = createContext<AuthContextData>({
  token: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

/**
 * Provedor do contexto que gere o estado da autenticação.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  // Estado que guarda o token JWT
  const [token, setToken] = useState<string | null>(null);

  // Ao iniciar, tenta carregar o token armazenado localmente
  useEffect(() => {
    const loadToken = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
      }
    };
    loadToken();
  }, []);

  // Função que realiza o login no backend
  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    const newToken = response.data.access_token;
    setToken(newToken);
    await AsyncStorage.setItem('token', newToken);
  };

  // Função que realiza o registo no backend
  const register = async (name: string, email: string, password: string) => {
    const response = await api.post('/auth/register', { name, email, password });
    const newToken = response.data.access_token;
    setToken(newToken);
    await AsyncStorage.setItem('token', newToken);
  };

  // Remove o token e termina a sessão
  const logout = async () => {
    setToken(null);
    await AsyncStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
