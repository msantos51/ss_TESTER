import { createContext, useContext, useState, ReactNode } from 'react';
import { api } from '../services/api';

export type AuthContextData = {
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextData>({
  token: null,
  login: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    const res = await api.post('/token', { username: email, password });
    const t: string = res.data.access_token;
    setToken(t);
    (global as any).__VENDOR_TOKEN__ = t;
  };

  const logout = () => {
    setToken(null);
    (global as any).__VENDOR_TOKEN__ = null;
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

