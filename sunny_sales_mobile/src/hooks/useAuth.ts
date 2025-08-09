// src/hooks/useAuth.ts
import { useState } from 'react';

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const login = async (email: string, password: string) => { /* ligar ao backend */ };
  const logout = () => setToken(null);
  return { token, login, logout };
}
