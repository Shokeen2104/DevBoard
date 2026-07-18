const socketIo = require('socket.io');
const { createClient } = require('redis');
const { createAdapter } = require('@socket.io/redis-adapter');

let io;

const initSocket = async (server) => {
  io = socketIo(server, {
    cors: {
      origin: '*', // We'll restrict this in a real env
      methods: ['GET', 'POST', 'PATCH', 'DELETE']
    }
  });

  if (process.env.REDIS_URL && !process.env.REDIS_URL.includes('localhost')) {
    try {
      const pubClient = createClient({ url: process.env.REDIS_URL, socket: { connectTimeout: 3000, reconnectStrategy: false } });
      const subClient = pubClient.duplicate();

      pubClient.on('error', () => {}); // ignore logs
      subClient.on('error', () => {}); // ignore logs

      await Promise.all([pubClient.connect(), subClient.connect()]);
      io.adapter(createAdapter(pubClient, subClient));
      console.log('Redis adapter connected for Socket.IO');
    } catch (err) {
      console.log('Redis connection failed, falling back to Memory Adapter for Socket.IO');
    }
  } else {
    console.log('Local dev detected, using Memory Adapter for Socket.IO (skipped Redis)');
  }

  io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);

    // Client emits joinBoard to join a specific board room
    socket.on('joinBoard', (boardId) => {
      socket.join(`board:${boardId}`);
      console.log(`Socket ${socket.id} joined room board:${boardId}`);
    });

    // Client emits leaveBoard
    socket.on('leaveBoard', (boardId) => {
      socket.leave(`board:${boardId}`);
      console.log(`Socket ${socket.id} left room board:${boardId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

module.exports = { initSocket, getIo };
