import { BASE_URL } from './config.js';

// (em português) Termina a sessão atual no servidor.
// O backend não expõe um endpoint /logout; as sessões dos vendedores são
// geridas em /vendors/me/sessions. Para terminar sessão corretamente é preciso
// descobrir a sessão atual (campo `current: true`) e apagá-la, caso contrário
// fica uma sessão pendente e o próximo login devolve 409 ("Sessão já ativa").
export async function terminateCurrentSession(token) {
  if (!token) return;
  try {
    const res = await fetch(`${BASE_URL}/vendors/me/sessions`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;
    const sessions = await res.json();
    const current = Array.isArray(sessions) ? sessions.find((s) => s.current) : null;
    if (!current) return;
    await fetch(`${BASE_URL}/vendors/me/sessions/${current.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    // O logout local prossegue mesmo que a limpeza remota falhe.
  }
}
