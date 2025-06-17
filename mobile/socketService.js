// Gerencia conexao WebSocket com o servidor para atualizacoes em tempo real
import { BASE_URL } from './config';

let socket = null;
let reconnectTimeout = null;
const listeners = new Set();

function getWsUrl() {
  // Convert http(s):// to ws(s)://
  return `${BASE_URL.replace(/^http/, 'ws')}/ws/locations`;
}

function connect() {
  if (socket) return;
  const url = getWsUrl();
  try {
    socket = new WebSocket(url);
  } catch (err) {
    console.log('Erro ao criar WebSocket:', err);
    scheduleReconnect();
    return;
  }

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      listeners.forEach((cb) => cb(data));
    } catch (e) {
      console.log('Erro ao processar mensagem WS:', e);
    }
  };

  socket.onclose = () => {
    socket = null;
    scheduleReconnect();
  };

  socket.onerror = () => {
    // Force close so onclose handles reconnection
    socket?.close();
  };
}

function scheduleReconnect() {
  if (reconnectTimeout) return;
  reconnectTimeout = setTimeout(() => {
    reconnectTimeout = null;
    connect();
  }, 3000);
}

export function subscribe(callback) {
  listeners.add(callback);
  connect();
  return () => listeners.delete(callback);
}

export function disconnect() {
  if (socket) {
    socket.close();
    socket = null;
  }
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }
  listeners.clear();
}
