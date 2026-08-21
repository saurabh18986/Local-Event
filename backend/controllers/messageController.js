const Message = require('../models/Message');
const RSVP = require('../models/RSVP');
const Event = require('../models/Event');

// ── GET /api/messages/:eventId ────────────────────────────────────────────────
exports.getMessages = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });

    // Only attendees or the creator can view chat
    const isCreator = event.creator.toString() === req.user._id.toString();
    const isAttendee = await RSVP.findOne({ user: req.user._id, event: req.params.eventId, status: 'going' });
    if (!isCreator && !isAttendee) {
      return res.status(403).json({ success: false, message: 'You must RSVP to view this chat.' });
    }

    const messages = await Message.find({ event: req.params.eventId })
      .populate('sender', 'name profileImage')
      .sort({ createdAt: 1 })
      .limit(100);

    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── POST /api/messages/:eventId ───────────────────────────────────────────────
exports.sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ success: false, message: 'Message cannot be empty.' });

    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });

    const isCreator = event.creator.toString() === req.user._id.toString();
    const isAttendee = await RSVP.findOne({ user: req.user._id, event: req.params.eventId, status: 'going' });
    if (!isCreator && !isAttendee) {
      return res.status(403).json({ success: false, message: 'You must RSVP to send messages.' });
    }

    const newMsg = await Message.create({ event: req.params.eventId, sender: req.user._id, message });
    await newMsg.populate('sender', 'name profileImage');

    // Broadcast to Socket.IO room
    const io = req.app.get('io');
    if (io) {
      io.to(`event_${req.params.eventId}`).emit('new_message', newMsg);
    }

    res.status(201).json({ success: true, data: newMsg });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
