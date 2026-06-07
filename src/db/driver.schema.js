const mongoose = require('mongoose');

// ─── Driver Schema ────────────────────────────────────────────
// Mirrors the CSV columns (sno, VNumber, driver name, vehicle type, status, etc.)
// plus extended profile fields from the app screens.

const driverSchema = new mongoose.Schema(
  {
    vNumber: {
      type: String,
      required: [true, 'Vehicle number (VNumber) is required'],
      unique: true,
      trim: true,
      uppercase: true,
      match: [/^[A-Z]{2}\s?\d{1,2}[\s]?[A-Z]{1,2}\s?\d{4}$/, 'Invalid Indian vehicle registration format'],
    },

    driverName: {
      type: String,
      required: [true, 'Driver name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
    },

    // Vehicle details
    vehicleType: {
      type: String,
      enum: ['Auto', 'Sedan', 'SUV', 'Truck', 'Van', 'Bike', 'Premium Auto'],
      default: 'Auto',
    },
    vehicleModel: {
      type: String,
      trim: true,  // e.g. "Bajaj RE (CNG)"
    },

    // Business status toggled by driver (Payments screen)
    status: {
      type: String,
      enum: ['available', 'on-duty', 'off-duty', 'inactive'],
      default: 'available',
    },

    // From CSV: Driver Status (boolean → string mapped)
    isVerified: {
      type: Boolean,
      default: false,  // admin verifies after KYC
    },

    // Rating aggregated from reviews (cached for quick display)
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    totalRides: {
      type: Number,
      default: 0,
    },
    acceptanceRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    // Contact
    whatsappNumber: {
      type: String,
      trim: true,
      match: [/^\+?91\d{10}$/, 'Invalid WhatsApp number (expected +91 followed by 10 digits)'],
    },
    phone: {
      type: String,
      trim: true,
    },

    // UPI / Payment
    upiId: {
      type: String,
      trim: true,
    },
    qrCodeUrl: {
      type: String,
      trim: true,  // hosted QR image URL
    },

    // Availability & profile
    languages: [{
      type: String,
      enum: ['Hindi', 'English', 'Bengali', 'Tamil', 'Telugu', 'Marathi', 'Gujarati', 'Kannada', 'Malayalam'],
    }],
    avatarUrl: {
      type: String,
      trim: true,
    },

    // Current/last known location (from GPS or maps embed)
    mapsUrl: {
      type: String,
      trim: true,
    },
    lastLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: [Number],  // [longitude, latitude]
    },

    // Schools the driver is associated with (school route regular)
    schools: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
    }],

    // Years of experience (shown on profile)
    experienceYears: {
      type: Number,
      min: 0,
      default: 0,
    },

    // Last service/inspection date (from CSV)
    lastServiceDate: Date,

    // UPI payment ID (e.g. "rajesh@upi")
    paymentId: {
      type: String,
      trim: true,
    },

    // Driver profile / onboarding
    onboardingStep: {
      type: Number,
      min: 0,
      max: 3,
      default: 0,  // 0=not started, 1=kyc, 2=vehicle, 3=payment, 4=active
    },
    kycStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },

    // Timestamps via timestamps option below
  },
  {
    timestamps: true,  // createdAt, updatedAt
  }
);

// Compound index for lookup by vehicle number
driverSchema.index({ vNumber: 1 });

// Geospatial index for "nearby drivers" queries (Go Anywhere feature)
driverSchema.index({ lastLocation: '2dsphere' });

// Text search index — covers driver name, vehicle model
driverSchema.index({ driverName: 'text', vehicleModel: 'text' });

module.exports = mongoose.model('Driver', driverSchema);
