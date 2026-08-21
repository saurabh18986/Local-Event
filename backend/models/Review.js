const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
  {
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    // The event creator being reviewed
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      maxlength: [500, 'Review cannot exceed 500 characters'],
      default: '',
    },
  },
  { timestamps: true }
);

// One review per reviewer per event
ReviewSchema.index({ reviewer: 1, event: 1 }, { unique: true });

module.exports = mongoose.model('Review', ReviewSchema);
