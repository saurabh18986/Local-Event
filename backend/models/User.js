const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // never returned in queries by default
    },
    googleId: { type: String, sparse: true },
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    profileImage: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      maxlength: [300, 'Bio cannot exceed 300 characters'],
      default: '',
    },
    location: {
      type: String,
      default: '',
    },
    // Aggregated reputation score (average of all reviews given to this user as creator)
    reputationScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    // Events created by this user
    createdEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
    // Events this user RSVP'd to
    rsvpEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
  },
  { timestamps: true }
);

// ── Hash password before save ─────────────────────────────────────────────────
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Instance method: compare password ────────────────────────────────────────
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
