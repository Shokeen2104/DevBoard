require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

// Connect to database
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Routes (to be added)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/workspaces', require('./routes/workspaceRoutes'));
app.use('/api/boards', require('./routes/boardRoutes'));
app.use('/api/lists', require('./routes/listRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));

// Basic error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Server Error' });
});

const http = require('http');
const { initSocket } = require('./config/socket');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Initialize Socket.io
if (process.env.NODE_ENV !== 'test') {
  initSocket(server).then(() => {
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  }).catch(err => {
    console.error('Failed to initialize socket:', err);
  });
}

module.exports = { app, server };
