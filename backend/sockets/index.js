const User = require('../models/User');

/**
 * Registers all Socket.IO event handlers.
 * @param {import('socket.io').Server} io
 */
const registerSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // ── Join personal notification room ────────────────────────────────────
    socket.on('join_user_room', (userId) => {
      socket.join(`user_${userId}`);
      console.log(`User ${userId} joined personal room`);
    });

    // ── Join event chat room ────────────────────────────────────────────────
    socket.on('join_event', (eventId) => {
      socket.join(`event_${eventId}`);
      console.log(`Socket ${socket.id} joined event room: ${eventId}`);
    });

    // ── Leave event chat room ───────────────────────────────────────────────
    socket.on('leave_event', (eventId) => {
      socket.leave(`event_${eventId}`);
    });

    // ── Typing indicator ────────────────────────────────────────────────────
    socket.on('typing', ({ eventId, userName }) => {
      socket.to(`event_${eventId}`).emit('user_typing', { userName });
    });

    socket.on('stop_typing', ({ eventId }) => {
      socket.to(`event_${eventId}`).emit('user_stop_typing');
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = registerSocketHandlers;
