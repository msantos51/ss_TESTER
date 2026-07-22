// (em português) Interceptor global de axios: deteta quando o backend rejeita
// o token de sessão do vendedor (token inválido/expirado, ou sessão terminada
// por login noutro dispositivo) e substitui a mensagem técnica por uma
// mensagem percetível, limpando a sessão local e redirecionando para o login.
import axios from 'axios';

const SESSION_ERROR_MESSAGES = {
  'Session invalidated': 'A tua sessão foi terminada porque iniciaste sessão noutro dispositivo.',
  'Invalid token': 'A tua sessão expirou. Por favor inicia sessão novamente.',
  'Invalid token signature': 'A tua sessão expirou. Por favor inicia sessão novamente.',
  'Token expired': 'A tua sessão expirou. Por favor inicia sessão novamente.',
  'Vendor not found': 'A tua sessão expirou. Por favor inicia sessão novamente.',
  'Not authenticated': 'A tua sessão expirou. Por favor inicia sessão novamente.',
};

export const SESSION_ENDED_MESSAGE_KEY = 'sessionEndedMessage';

axios.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const detail = err.response?.data?.detail;
    const hadAuthHeader = !!err.config?.headers?.Authorization;
    const friendlyMessage = SESSION_ERROR_MESSAGES[detail];

    if ((status === 401 || status === 403) && hadAuthHeader && friendlyMessage) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.setItem(SESSION_ENDED_MESSAGE_KEY, friendlyMessage);
      err.response.data.detail = friendlyMessage;
      if (window.location.pathname !== '/vendor-login') {
        window.location.assign('/vendor-login');
      }
    }
    return Promise.reject(err);
  }
);
