require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const connectDB = require('./config/db');
const { initializeSocket } = require('./socket');

connectDB();

const app = express();

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173,http://localhost:80,http://localhost')
  .split(',')
  .map(url => url.trim().replace(/\/+$/, ''));

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const cleanOrigin = origin.replace(/\/+$/, '');
    if (allowedOrigins.includes('*') || allowedOrigins.includes(cleanOrigin)) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'SyncBoard API is running' });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/boards', require('./routes/boardRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/orgs', require('./routes/orgRoutes'));

const server = http.createServer(app);
initializeSocket(server);

if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
  });
}

module.exports = app;