const mongoose = require('mongoose');

// ─── Review Schema ────────────────────────────────────────────
// Ratings and reviews submitted by riders after a completed ride.

const reviewSchema = new mongoose.Schema(
  {
    rider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      required: true,
    },

    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },

    // Overall rating (1-5)
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    // Individual category ratings
    categories: {
      punctuality: {
        type: Number,
        min: 1,
        max: 5,
      },
      behavior: {
        type: Number,
        min: 1,
        max: 5,
      },
      vehicleCleanliness: {
        type: Number,
        min: 1,
        max: 5,
      },
      friendliness: {
        type: Number,
        min: 1,
        max: 5,
      },
    },

    reviewText: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    // Ride photo / evidence (optional)
    photoUrl: {
      type: String,
      trim: true,
    },

    // Driver's response (optional)
    driverResponse: {
      text: String,
      respondedAt: Date,
    },

    isAnonymous: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// One review per rider per driver (prevent duplicates)
reviewSchema.index({ rider: 1, driver: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
