const mongoose = require('mongoose');

// ─── Payment Schema ───────────────────────────────────────────
// Tracks each payment transaction linked to a booking.

const paymentSchema = new mongoose.Schema(
  {
    // Parent booking
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },

    payer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    payee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      required: true,
    },

    // Transaction details
    amount: {
      type: Number,
      min: 0,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
      enum: ['INR'],
    },

    // Payment method
    method: {
      type: String,
      enum: ['cash', 'upi'],
      required: true,
    },

    // UPI-specific fields
    upiTransactionId: {
      type: String,
      trim: true,
    },
    upiPaymentId: {
      type: String,  // e.g. the UPI ID "rajesh@upi"
      trim: true,
    },
    qrCodeScanned: {
      type: Boolean,
      default: false,
    },

    // Status
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },

    // Receipt / proof
    receiptUrl: {
      type: String,
      trim: true,
    },

    // Metadata (flexible — screenshots, UTR numbers, etc.)
    metadata: {
      utrNumber: String,
      screenshotUrl: String,
      note: String,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure one payment per booking (each booking has at most one recorded payment)
paymentSchema.index({ booking: 1 }, { unique: true });

module.exports = mongoose.model('Payment', paymentSchema);
