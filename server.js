require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/database');
const { Server } = require('socket.io');
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const chatRoutes = require('./src/routes/chatRoutes');
const { registerSocketHandlers } = require('./src/socket/socketHandler');

const app = express();
const server = http.createServer(app);
const allowedOrigin = process.env.CLIENT_URL || '*';

app.use(cors({ origin: allowedOrigin === '*' ? true : allowedOrigin }));
app.use(express.json({ limit: '2mb' }));

app.get('/', (req, res) => {
  res.json({ success: true, message: 'ChatWave backend is running' });
});
app.get('/api/health', (req, res) => res.json({ success: true }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);

const io = new Server(server, {
  cors: { origin: allowedOrigin === '*' ? '*' : allowedOrigin, methods: ['GET', 'POST'] }
});
app.set('io', io);
registerSocketHandlers(io);

const PORT = process.env.PORT || 8080;
connectDB().then(() => {
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch((error) => {
  console.error('Database connection failed:', error.message);
  process.exit(1);
});
