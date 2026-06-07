const mongoose = require('mongoose');

// ─── Chat Schema ──────────────────────────────────────────────
// Messages between riders and drivers (WhatsApp-style chat).
// Supports both 1-on-1 conversations and system alerts.

const chatSchema = new mongoose.Schema(
  {
    // Participants
    participants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    }],

    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
    },

    // The booking this conversation relates to (nullable for system chats)
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
    },

    // Message type — distinguishes user messages from system alerts
    channelType: {
      type: String,
      enum: ['direct', 'support', 'alerts', 'payments-help'],
      default: 'direct',
    },

    // Individual message
    messages: [{
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      isSystem: {
        type: Boolean,
        default: false,
      },
      text: {
        type: String,
        required: true,
        trim: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
      status: {
        type: String,
        enum: ['sent', 'delivered', 'read'],
        default: 'sent',
      },
    }],

    // Last message summary (for the chat list view)
    lastMessage: {
      text: String,
      timestamp: Date,
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      isRead: {
        type: Boolean,
        default: false,
      },
    },

    // Unread count for the current user
    unreadCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-update lastMessage when a new message is pushed
chatSchema.pre('messages.push', function (msg) {
  this.lastMessage = {
    text: msg.text,
    timestamp: msg.timestamp,
    sender: msg.sender,
    isRead: false,
  };
});

// Index for finding all conversations a user is part of
chatSchema.index({ participants: 1, updatedAt: -1 });

module.exports = mongoose.model('Chat', chatSchema);
