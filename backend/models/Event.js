const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    endDate: {
      type: Date,
    },
    location: {
      address: {
        type: String,
        required: [true, 'Address is required'],
      },
      // GeoJSON format for MongoDB 2dsphere index
      coordinates: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point',
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          required: true,
        },
      },
    },
    tags: [
      {
        type: String,
        enum: ['music', 'art', 'workshop', 'sports', 'meetup', 'technology', 'food', 'networking', 'other'],
      },
    ],
    image: {
      type: String,
      default: '',
    },
    capacity: {
      type: Number,
      default: 0, // 0 = unlimited
      min: 0,
    },
    price: {
      type: Number,
      default: 0, // 0 = free
      min: 0,
    },
    isFree: {
      type: Boolean,
      default: true,
    },
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    // Aggregated review data
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// ── 2dsphere index for geo queries ─────────────────────────────────────────────
EventSchema.index({ 'location.coordinates': '2dsphere' });
EventSchema.index({ date: 1 });
EventSchema.index({ tags: 1 });

module.exports = mongoose.model('Event', EventSchema);
