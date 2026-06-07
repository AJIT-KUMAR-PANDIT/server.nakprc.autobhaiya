const mongoose = require('mongoose');

// ─── TripAlert Schema ─────────────────────────────────────────
// System-generated alerts — trip status updates, driver location pings, etc.

const tripAlertSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
    },

    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
    },

    // Alert category
    category: {
      type: String,
      enum: ['trip-started', 'driver-en-route', 'driver-arrived',
             'trip-completed', 'payment-received', 'delay-alert',
             'safety-alert', 'support-response'],
      required: true,
    },

    // Display text — "Driver Bablu has arrived" etc.
    title: {
      type: String,
      required: true,
      trim: true,
    },

    body: {
      type: String,
      trim: true,
    },

    iconEmoji: {
      type: String,  // e.g. "🔔", "🛺", "💳"
      trim: true,
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    deepLink: {
      type: String,  // route to open when tapped (e.g. "/auto-bhaiya/DL1C5678")
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for user's unread alerts
tripAlertSchema.index({ user: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('TripAlert', tripAlertSchema);
