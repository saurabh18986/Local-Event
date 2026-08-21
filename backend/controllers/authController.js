const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ── Generate JWT ──────────────────────────────────────────────────────────────
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// ── POST /api/auth/register ───────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        reputationScore: user.reputationScore,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── POST /api/auth/login ──────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.password) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        reputationScore: user.reputationScore,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('createdEvents', 'title date location.address image')
      .populate('rsvpEvents', 'title date location.address image');

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET /api/auth/google/callback — handled by Passport, then redirect ────────
exports.googleCallback = (req, res) => {
  const token = generateToken(req.user._id);
  // Redirect to frontend with token in query param
  res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
};
