require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const passport = require('passport');
const connectDB = require('./config/db');
const seedDemoEvents = require('./utils/seedDemoEvents');
const registerSocketHandlers = require('./sockets');

// ── Init ──────────────────────────────────────────────────────────────────────
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL, methods: ['GET', 'POST'] },
});

// Make io accessible in controllers via req.app.get('io')
app.set('io', io);

// ── Connect DB & Seed ─────────────────────────────────────────────────────────
connectDB().then(() => seedDemoEvents());

// ── Passport ──────────────────────────────────────────────────────────────────
require('./config/passport');
app.use(passport.initialize());

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));
app.use('/api/rsvp', require('./routes/rsvp'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/messages', require('./routes/messages'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', env: process.env.NODE_ENV }));

// 404 handler
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found.' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || 'Server error.' });
});

// ── Socket.IO ─────────────────────────────────────────────────────────────────
registerSocketHandlers(io);

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
