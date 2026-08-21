const mongoose = require('mongoose');

const RSVPSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    status: {
      type: String,
      enum: ['going', 'cancelled'],
      default: 'going',
    },
  },
  { timestamps: true }
);

// Ensure one RSVP per user per event
RSVPSchema.index({ user: 1, event: 1 }, { unique: true });

module.exports = mongoose.model('RSVP', RSVPSchema);
