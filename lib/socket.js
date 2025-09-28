import { io } from 'socket.io-client';

let socket;

export const initSocket = () => {
  if (!socket) {
    socket = io(process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001', {
      transports: ['websocket', 'polling']
    });
    
    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
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