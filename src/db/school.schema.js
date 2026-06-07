const mongoose = require('mongoose');

// ─── School Schema ────────────────────────────────────────────
// Represents schools whose students use Auto Bhaiya for daily rides.

const schoolSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'School name is required'],
      unique: true,
      trim: true,
      minlength: [2, 'School name must be at least 2 characters'],
    },

    // Display avatar emoji (e.g. "🏫") or URL
    avatarEmoji: {
      type: String,
      trim: true,
    },
    avatarUrl: {
      type: String,
      trim: true,
    },

    // Contact
    address: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,  // e.g. "Jamshedpur"
    },
    mapsUrl: {
      type: String,
      trim: true,
    },

    // Location for proximity queries
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: [Number],  // [longitude, latitude]
    },

    // Driver pool that services this school
    drivers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
    }],

    // Admin / principal contact
    adminName: {
      type: String,
      trim: true,
    },
    adminPhone: {
      type: String,
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Geospatial index for "schools near me" queries
schoolSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('School', schoolSchema);
