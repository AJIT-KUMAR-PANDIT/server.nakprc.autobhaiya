const mongoose = require('mongoose');

// ─── Search History Schema ────────────────────────────────────
// Server-side equivalent of the client's localStorage searchHistory.
// Tracks what users searched for to improve recommendations.

const searchHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // What the user typed
    query: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    // Whether it was a "Go Anywhere" search
    isGoAnywhere: {
      type: Boolean,
      default: false,
    },

    goAnywhereDestination: {
      type: String,
      trim: true,
    },

    // Results shown (store plate numbers for analytics)
    resultsCount: {
      type: Number,
      default: 0,
    },
    resultPlateNumbers: [{
      type: String,
      trim: true,
    }],

    // Did the user book from these results?
    bookedPlateNumber: {
      type: String,
      trim: true,
    },

    // Location context (approximate — stored as city name)
    city: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for retrieving a user's search history in order
searchHistorySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('SearchHistory', searchHistorySchema);
