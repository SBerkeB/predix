import { io } from 'socket.io-client';

let socket;

export const initSocket = () => {
  if (!socket) {
    const serverUrl = process.env.NODE_ENV === 'production' 
      ? process.env.NEXT_PUBLIC_SOCKET_URL || '' 
      : 'http://localhost:3001';
    
    socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      maxReconnectionAttempts: 5
    });
    
    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('disconnect', (reason) => {
      console.log('Disconnected from server:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error.message);
      // Gracefully handle connection errors without breaking the app
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('Reconnected to server after', attemptNumber, 'attempts');
    });

    socket.on('reconnect_error', (error) => {
      console.error('Reconnection failed:', error.message);
    });

    socket.on('reconnect_failed', () => {
      console.error('Failed to reconnect to server after maximum attempts');
    });
  }
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initSocket();
  }
  return socket;
};

export const emitVoteUpdate = (predictionData) => {
  if (socket) {
    socket.emit('vote-update', predictionData);
  }
};

export const emitPredictionCreated = (predictionData) => {
  if (socket) {
    socket.emit('prediction-created', predictionData);
  }
};

export const onVoteUpdated = (callback) => {
  const socket = getSocket();
  socket.on('vote-updated', callback);
};

export const onPredictionAdded = (callback) => {
  const socket = getSocket();
  socket.on('prediction-added', callback);
};

export const offVoteUpdated = (callback) => {
  const socket = getSocket();
  socket.off('vote-updated', callback);
};

export const offPredictionAdded = (callback) => {
  const socket = getSocket();
  socket.off('prediction-added', callback);
};