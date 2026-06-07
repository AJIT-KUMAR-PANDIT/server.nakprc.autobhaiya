const mongoose = require('mongoose');

// ─── Booking Schema ───────────────────────────────────────────
// Core entity: a booked ride between a rider (parent/student) and a driver.
// Supports both "Book for School" and "Book Trip" (Go Anywhere).

const bookingSchema = new mongoose.Schema(
  {
    // The rider who made the booking
    rider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // The driver being booked
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      required: true,
    },

    // Type of booking
    type: {
      type: String,
      enum: ['school-ride', 'go-anywhere'],
      required: true,
    },

    // For school-ride: recurring daily pickup
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
    },

    // Trip details
    origin: {
      address: String,
      location: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point',
        },
        coordinates: [Number],  // [longitude, latitude]
      },
    },

    destination: {
      address: String,
      location: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point',
        },
        coordinates: [Number],
      },
    },

    // Pricing
    estimatedPrice: {
      type: Number,
      min: 0,
    },
    finalPrice: {
      type: Number,
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
      enum: ['INR'],
    },

    // Payment method chosen by rider
    paymentMethod: {
      type: String,
      enum: ['cash', 'upi', 'wallet'],
      default: 'cash',
    },

    // Booking lifecycle status
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
      default: 'pending',
    },

    // Recurring schedule (for school rides)
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringDays: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    }],
    pickupTime: {
      type: String,  // "07:30"
    },
    dropoffTime: {
      type: String,  // "14:00"
    },

    // Driver ETA info
    estimatedArrival: {
      type: String,  // "5 mins"
    },

    // Cancellation
    cancelledAt: Date,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    cancellationReason: String,

    // Notes / messages exchanged during booking
    notes: String,

    // Vehicle plate shown to rider
    vehiclePlate: String,

    // For Go Anywhere trips — destination keyword from search
    goAnywhereQuery: {
      type: String,
      trim: true,
    },

  },
  {
    timestamps: true,
  }
);

// Indexes
bookingSchema.index({ rider: 1, createdAt: -1 });   // rider's booking history
bookingSchema.index({ driver: 1, createdAt: -1 });    // driver's booking history
bookingSchema.index({ status: 1, createdAt: -1 });     // quick filter by status

module.exports = mongoose.model('Booking', bookingSchema);
