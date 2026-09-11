import { useState } from 'react';
import { BASE_URL } from '../config';

// (em português) Página pública de gestão de dados da conta de vendedor.
//
// Existe por duas razões. A Google Play exige que qualquer app com contas
// ofereça a eliminação por um URL acessível fora da app — quem já desinstalou
// tem de conseguir apagar a conta à mesma. E o RGPD dá ao titular o direito de
// levar consigo os seus dados (art. 20.º) e de os apagar (art. 17.º).
//
// Não é uma área de vendedor: autentica, executa uma das duas ações e termina
// logo a sessão. O site continua dedicado ao banhista.
export default function AccountDeletion() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [needsForce, setNeedsForce] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);

  const authenticate = async (force = false) => {
    setBusy(true);
    setError('');
    setInfo('');
    try {
      const res = await fetch(`${BASE_URL}/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, force }),
      });
      const body = await res.json().catch(() => ({}));
      if (res.status === 409) {
        setNeedsForce(true);
        throw new Error(
          'Tens sessão iniciada na app. Podes continuar, mas isso termina essa sessão.'
        );
      }
      if (!res.ok) throw new Error(body.detail || 'Email ou palavra-passe incorretos.');
      setToken(body.access_token);
      setNeedsForce(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  // Termina a sessão criada por esta página, para não deixar o vendedor
  // bloqueado com um 409 no próximo início de sessão na app.
  const releaseSession = async (activeToken) => {
    try {
      const res = await fetch(`${BASE_URL}/vendors/me/sessions`, {
        headers: { Authorization: `Bearer ${activeToken}` },
      });
      if (!res.ok) return;
      const sessions = await res.json();
      const current = Array.isArray(sessions) ? sessions.find((s) => s.current) : null;
      if (!current) return;
      await fetch(`${BASE_URL}/vendors/me/sessions/${current.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${activeToken}` },
      });
    } catch {
      // Sem consequências para o utilizador: a sessão expira sozinha.
    }
  };

  const exportData = async () => {
    setBusy(true);
    setError('');
    setInfo('');
    try {
      const res = await fetch(`${BASE_URL}/vendors/me/export`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Não foi possível preparar os teus dados.');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'sunny-sales-dados.json';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setInfo('Os teus dados foram descarregados em formato JSON.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const deleteAccount = async () => {
    setBusy(true);
    setError('');
    setInfo('');
    try {
      const res = await fetch(`${BASE_URL}/vendors/me`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.detail || 'Não foi possível eliminar a conta.');
      setToken(null);
      setPassword('');
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const finish = async () => {
    if (token) await releaseSession(token);
    setToken(null);
    setPassword('');
    setConfirming(false);
    setInfo('Sessão terminada.');
  };

  return (
    <div className="legal-page">
      <div className="legal-container">
        <div className="legal-header">
          <h1>Os teus dados e a tua conta</h1>
          <p className="last-updated">Vendedores Sunny Sales</p>
        </div>

        {done ? (
          <section>
            <h2>Conta eliminada</h2>
            <p>
              Os teus dados pessoais foram apagados: perfil, trajetos GPS,
              produtos, stories e fotografias. A conta já não inicia sessão e o
              email fica livre para um registo novo, se um dia quiseres voltar.
            </p>
            <p>
              Conservamos apenas o registo dos pagamentos, sem dados pessoais
              associados, porque a lei fiscal portuguesa obriga a guardar os
              documentos de faturação durante 10 anos.
            </p>
          </section>
        ) : (
          <>
            <section>
              <h2>O que podes fazer aqui</h2>
              <p>
                Esta página serve os vendedores registados na app Sunny Sales.
                Depois de confirmares quem és, podes descarregar tudo o que
                guardamos sobre ti, ou eliminar a conta em definitivo. Ambas as
                ações também estão disponíveis dentro da app, em{' '}
                <strong>Perfil → Os teus dados</strong>.
              </p>
            </section>

            <section>
              <h3>O que é apagado, se eliminares a conta</h3>
              <ul>
                <li>Perfil: nome, email, telefone, morada, NIF, IBAN e foto.</li>
                <li>Histórico de trajetos e todas as posições GPS registadas.</li>
                <li>Produtos, stories e respetivas fotografias e vídeos.</li>
                <li>Sessões abertas em qualquer dispositivo.</li>
              </ul>
              <h3>O que é conservado</h3>
              <ul>
                <li>
                  O registo dos pagamentos, sem dados pessoais associados,
                  durante os 10 anos que a lei fiscal exige. O RGPD (art. 17.º,
                  n.º 3, al. b)) ressalva expressamente esta obrigação legal.
                </li>
              </ul>
              <p>
                <strong>A eliminação é irreversível.</strong> Se quiseres ficar
                com uma cópia, descarrega os dados antes.
              </p>
            </section>

            <section>
              {error && <p className="account-msg account-msg-error">{error}</p>}
              {info && <p className="account-msg account-msg-info">{info}</p>}

              {!token ? (
                <form
                  className="account-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    authenticate(false);
                  }}
                >
                  <label className="account-label" htmlFor="account-email">
                    Email da conta
                  </label>
                  <input
                    id="account-email"
                    className="account-input"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <label className="account-label" htmlFor="account-password">
                    Palavra-passe
                  </label>
                  <input
                    id="account-password"
                    className="account-input"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button className="account-btn" type="submit" disabled={busy}>
                    {busy ? 'A confirmar…' : 'Confirmar identidade'}
                  </button>
                  {needsForce && (
                    <button
                      className="account-btn account-btn-ghost"
                      type="button"
                      disabled={busy}
                      onClick={() => authenticate(true)}
                    >
                      Continuar e terminar a sessão na app
                    </button>
                  )}
                </form>
              ) : (
                <div className="account-form">
                  <p>
                    Sessão confirmada para <strong>{email}</strong>.
                  </p>
                  <button
                    className="account-btn account-btn-ghost"
                    type="button"
                    disabled={busy}
                    onClick={exportData}
                  >
                    {busy ? 'A preparar…' : 'Descarregar os meus dados (JSON)'}
                  </button>

                  {!confirming ? (
                    <button
                      className="account-btn account-btn-danger"
                      type="button"
                      disabled={busy}
                      onClick={() => setConfirming(true)}
                    >
                      Eliminar a minha conta
                    </button>
                  ) : (
                    <>
                      <p>
                        Confirmas que queres eliminar em definitivo a conta de{' '}
                        <strong>{email}</strong>?
                      </p>
                      <button
                        className="account-btn account-btn-danger"
                        type="button"
                        disabled={busy}
                        onClick={deleteAccount}
                      >
                        {busy ? 'A eliminar…' : 'Sim, eliminar em definitivo'}
                      </button>
                      <button
                        className="account-btn account-btn-ghost"
                        type="button"
                        disabled={busy}
                        onClick={() => setConfirming(false)}
                      >
                        Cancelar
                      </button>
                    </>
                  )}

                  <button
                    className="account-btn account-btn-ghost"
                    type="button"
                    disabled={busy}
                    onClick={finish}
                  >
                    Terminar sessão
                  </button>
                </div>
              )}
            </section>
          </>
        )}

        <section>
          <h2>Precisas de ajuda?</h2>
          <p>
            Se não conseguires aceder à conta, escreve-nos pela página de{' '}
            <a href="/contacto">contacto</a> a partir do email registado.
            Respondemos a qualquer pedido de acesso, correção ou apagamento no
            prazo de 30 dias, como exige o RGPD.
          </p>
        </section>
      </div>
    </div>
  );
}
