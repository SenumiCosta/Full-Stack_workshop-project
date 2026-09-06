const socketio = require('socket.io');

let io;

const initializeSocket = (server) => {
  const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173,http://localhost:80,http://localhost')
    .split(',')
    .map(url => url.trim().replace(/\/+$/, ''));

  io = socketio(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const cleanOrigin = origin.replace(/\/+$/, '');
        if (allowedOrigins.includes('*') || allowedOrigins.includes(cleanOrigin)) {
          return callback(null, true);
        }
        return callback(null, true);
      },
      methods: ['GET', 'POST'],
      credentials: true
    },
    path: '/socket.io/'
  });

  io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);

    socket.on('join-board', (boardId) => {
      socket.join(`board-${boardId}`);
      console.log(`Socket ${socket.id} joined board-${boardId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

const emitTaskCreated = (boardId, task) => {
  io.to(`board-${boardId}`).emit('task-created', task);
};

const emitTaskUpdated = (boardId, task) => {
  io.to(`board-${boardId}`).emit('task-updated', task);
};

const emitTaskDeleted = (boardId, taskId) => {
  io.to(`board-${boardId}`).emit('task-deleted', taskId);
};

module.exports = { initializeSocket, getIO, emitTaskCreated, emitTaskUpdated, emitTaskDeleted };