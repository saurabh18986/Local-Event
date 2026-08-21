const Review = require('../models/Review');
const Event = require('../models/Event');
const User = require('../models/User');
const RSVP = require('../models/RSVP');

// ── POST /api/reviews/:eventId ────────────────────────────────────────────────
exports.createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });

    // Only attendees can review, and event must have passed
    if (new Date(event.date) > new Date()) {
      return res.status(400).json({ success: false, message: 'You can only review past events.' });
    }

    const rsvp = await RSVP.findOne({ user: req.user._id, event: req.params.eventId, status: 'going' });
    if (!rsvp) {
      return res.status(403).json({ success: false, message: 'You must have RSVPd to review this event.' });
    }

    const existing = await Review.findOne({ reviewer: req.user._id, event: req.params.eventId });
    if (existing) return res.status(400).json({ success: false, message: 'You have already reviewed this event.' });

    const review = await Review.create({
      reviewer: req.user._id,
      event: req.params.eventId,
      creator: event.creator,
      rating,
      comment,
    });

    // Update event average rating
    const reviews = await Review.find({ event: req.params.eventId });
    const avg = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
    await Event.findByIdAndUpdate(req.params.eventId, { averageRating: avg.toFixed(1), totalReviews: reviews.length });

    // Update creator's reputation score
    const creatorReviews = await Review.find({ creator: event.creator });
    const creatorAvg = creatorReviews.reduce((acc, r) => acc + r.rating, 0) / creatorReviews.length;
    await User.findByIdAndUpdate(event.creator, {
      reputationScore: creatorAvg.toFixed(1),
      totalReviews: creatorReviews.length,
    });

    await review.populate('reviewer', 'name profileImage');
    res.status(201).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET /api/reviews/:eventId ─────────────────────────────────────────────────
exports.getEventReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ event: req.params.eventId })
      .populate('reviewer', 'name profileImage')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET /api/reviews/user/:userId ─────────────────────────────────────────────
exports.getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ creator: req.params.userId })
      .populate('reviewer', 'name profileImage')
      .populate('event', 'title date')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
