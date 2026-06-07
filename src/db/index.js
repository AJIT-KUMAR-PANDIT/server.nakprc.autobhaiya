// ─── demo/db/index.js ─────────────────────────────────────────
// Central export — import models from here

const connectDB = require('./mongoose');
const Driver  = require('./driver.schema');
const School  = require('./school.schema');
const User    = require('./user.schema');
const Booking = require('./booking.schema');
const Payment = require('./payment.schema');
const Chat    = require('./chat.schema');
const Review  = require('./review.schema');
const SearchHistory = require('./search-history.schema');
const TripAlert   = require('./trip-alert.schema');

module.exports = {
  // Connection
  connectDB,

  // Models
  Driver,
  School,
  User,
  Booking,
  Payment,
  Chat,
  Review,
  SearchHistory,
  TripAlert,
};
