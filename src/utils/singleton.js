import { io } from 'socket.io-client';
import { BaseUrl } from './constans';
import { getSocketUrl } from './socketConfig';

let socket = null;

export function getSocket() {
  if (socket) return socket;

  const url = getSocketUrl(BaseUrl);
  const token = (typeof window !== 'undefined' && localStorage.getItem('token')) || '';

  socket = io(url, {
    path: '/socket.io',
    transports: ['polling', 'websocket'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    auth: { token }
  });

  socket.on('connect_error', (e) => {
    console.error('[WS connect_error]', e?.message || e);
  });

  return socket;
}

export function closeSocket() {
  if (!socket) return;
  try {
    socket.removeAllListeners();
    socket.disconnect();
  } catch (error) {
    console.error('singleton closeSocket error:', error);
  }
  socket = null;
}