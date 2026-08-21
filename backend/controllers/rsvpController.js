const RSVP = require('../models/RSVP');
const Event = require('../models/Event');
const User = require('../models/User');

// ── POST /api/rsvp/:eventId ───────────────────────────────────────────────────
exports.rsvpEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });

    // Prevent creator from RSVPing their own event
    if (event.creator.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot RSVP to your own event.' });
    }

    // Check capacity
    if (event.capacity > 0 && event.attendees.length >= event.capacity) {
      return res.status(400).json({ success: false, message: 'Event is at full capacity.' });
    }

    // Check existing RSVP
    const existing = await RSVP.findOne({ user: req.user._id, event: req.params.eventId });
    if (existing) {
      if (existing.status === 'going') {
        return res.status(400).json({ success: false, message: 'You have already RSVPd to this event.' });
      }
      // Re-activate cancelled RSVP
      existing.status = 'going';
      await existing.save();
      await Event.findByIdAndUpdate(req.params.eventId, { $addToSet: { attendees: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $addToSet: { rsvpEvents: req.params.eventId } });
      return res.json({ success: true, message: 'RSVP confirmed!', rsvp: existing });
    }

    const rsvp = await RSVP.create({ user: req.user._id, event: req.params.eventId });
    await Event.findByIdAndUpdate(req.params.eventId, { $addToSet: { attendees: req.user._id } });
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { rsvpEvents: req.params.eventId } });

    // Emit Socket.IO notification to event creator
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${event.creator}`).emit('rsvp_notification', {
        eventId: event._id,
        eventTitle: event.title,
        userName: req.user.name,
        userImage: req.user.profileImage,
        message: `${req.user.name} just RSVPd to your event "${event.title}"!`,
      });
    }

    res.status(201).json({ success: true, message: 'RSVP confirmed!', rsvp });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── DELETE /api/rsvp/:eventId ─────────────────────────────────────────────────
exports.cancelRSVP = async (req, res) => {
  try {
    const rsvp = await RSVP.findOne({ user: req.user._id, event: req.params.eventId });
    if (!rsvp) return res.status(404).json({ success: false, message: 'RSVP not found.' });

    rsvp.status = 'cancelled';
    await rsvp.save();
    await Event.findByIdAndUpdate(req.params.eventId, { $pull: { attendees: req.user._id } });
    await User.findByIdAndUpdate(req.user._id, { $pull: { rsvpEvents: req.params.eventId } });

    res.json({ success: true, message: 'RSVP cancelled.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET /api/rsvp/:eventId/attendees ─────────────────────────────────────────
exports.getAttendees = async (req, res) => {
  try {
    const rsvps = await RSVP.find({ event: req.params.eventId, status: 'going' }).populate(
      'user',
      'name profileImage location'
    );
    res.json({ success: true, data: rsvps });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET /api/rsvp/my-rsvps ────────────────────────────────────────────────────
exports.getMyRSVPs = async (req, res) => {
  try {
    const rsvps = await RSVP.find({ user: req.user._id, status: 'going' }).populate({
      path: 'event',
      populate: { path: 'creator', select: 'name profileImage reputationScore' },
    });
    res.json({ success: true, data: rsvps });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
