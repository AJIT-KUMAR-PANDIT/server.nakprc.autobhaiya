const mongoose = require('mongoose');

// ─── User Schema ──────────────────────────────────────────────
// Represents a rider (parent/student) who books Auto Bhaiya services.
// In the future this could also represent admin/super-admin accounts.

const userSchema = new mongoose.Schema(
  {
    // Identity
    name: {
      type: String,
      required: [true, 'User name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
    },

    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      sparse: true,  // allow null for future OAuth-only users
      match: [/^\+?91\d{10}$/, 'Invalid Indian phone number'],
    },

    // Authentication — OTP (WhatsApp) or future email/social
    authMethod: {
      type: String,
      enum: ['phone-otp', 'whatsapp', 'email', 'google'],
      default: 'phone-otp',
    },

    avatarUrl: {
      type: String,
      trim: true,
    },

    // Linked to a school (for parent/students)
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
    },

    // Total rides completed as rider
    totalRides: {
      type: Number,
      default: 0,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for quick phone lookup (OTP login)
userSchema.index({ phone: 1 });

module.exports = mongoose.model('User', userSchema);
