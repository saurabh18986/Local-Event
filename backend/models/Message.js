const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: [true, 'Message cannot be empty'],
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
      trim: true,
    },
  },
  { timestamps: true }
);

MessageSchema.index({ event: 1, createdAt: 1 });

module.exports = mongoose.model('Message', MessageSchema);
