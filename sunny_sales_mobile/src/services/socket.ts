import { io } from 'socket.io-client';

export const socket = io('https://ss-tester.onrender.com', {
  transports: ['websocket'],
});
