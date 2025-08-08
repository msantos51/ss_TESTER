// (em português) Hook simples para autenticação (placeholder para expansão futura).
import { useState } from 'react';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  return { user, setUser };
}
