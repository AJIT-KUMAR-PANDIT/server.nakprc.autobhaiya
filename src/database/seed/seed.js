#!/usr/bin/env node
/**
 * seed/seed.js — Load all demo data into MongoDB.
 *
 * Usage:  node demo/db/seed/seed.js
 * Requires: MongoDB running, `mongoose` in devDependencies
 */

const path    = require('path');
const fs      = require('fs');
const mongoose = require('mongoose');

// ── Paths ────────────────────────────────────────────────────────
const DB_DIR   = path.resolve(__dirname);
const SEED_DIR = path.join(DB_DIR, 'seed');

// ── Connect ──────────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/autobhaiya', {
  serverSelectionTimeoutMS: 5000,
});

const School   = require(path.join(DB_DIR, 'school.schema'));
const Driver   = require(path.join(DB_DIR, 'driver.schema'));
const User     = require(path.join(DB_DIR, 'user.schema'));
const Booking  = require(path.join(DB_DIR, 'booking.schema'));
const Payment  = require(path.join(DB_DIR, 'payment.schema'));
const Chat     = require(path.join(DB_DIR, 'chat.schema'));
const Review   = require(path.join(DB_DIR, 'review.schema'));
const SearchHistory = require(path.join(DB_DIR, 'search-history.schema'));
const TripAlert   = require(path.join(DB_DIR, 'trip-alert.schema'));

// ── Helpers ──────────────────────────────────────────────────────

function readSeed(file) {
  const raw = fs.readFileSync(path.join(SEED_DIR, file), 'utf-8');
  return JSON.parse(raw);
}

/**
 * Resolve $placeholder references in a document tree.
 * Placeholders: $school1, $driver7, $rider3, $booking2
 */
function resolve(doc, map) {
  if (doc == null) return null;
  if (typeof doc === 'string') {
    const m = doc.match(/^\$(school|driver|rider|booking)(\d+)$/i);
    return m ? map[`${m[1]}${parseInt(m[2])}`] : doc;
  }
  if (Array.isArray(doc)) return doc.map(d => resolve(d, map));
  const out = {};
  for (const [k, v] of Object.entries(doc)) {
    out[k] = resolve(v, map);
  }
  return out;
}

function toObjectId(val) {
  if (typeof val === 'string' && mongoose.Types.ObjectId.isValid(val)) {
    return new mongoose.Types.ObjectId(val);
  }
  return val; // null or already ObjectId
}

// ── Seed ─────────────────────────────────────────────────────────

async function seed() {
  console.log('\n🌱 Starting seed...\n');

  // Clean slate
  await mongoose.connection.db.dropDatabase();
  console.log('🗑️  Database dropped.\n');

  // ── 1. Insert base collections (ordered — others depend on them) ──

  const schools = readSeed('schools.json').map(s => ({ ...s, createdAt: new Date(), updatedAt: new Date() }));
  await School.insertMany(schools);
  console.log(`✅ Schools: ${schools.length}`);

  const drivers = readSeed('drivers.json').map(d => ({ ...d, createdAt: new Date(), updatedAt: new Date() }));
  await Driver.insertMany(drivers);
  console.log(`✅ Drivers: ${drivers.length}`);

  const users = readSeed('users.json').map(u => ({ ...u, createdAt: new Date(), updatedAt: new Date() }));
  await User.insertMany(users);
  console.log(`✅ Users: ${users.length}\n`);

  // ── 2. Build ID mapping ────────────────────────────────────────

  const allSchools = await School.find();
  const allDrivers = await Driver.find();
  const allUsers   = await User.find();

  const map = {};
  allSchools.forEach((s, i) => { map[`school${i + 1}`] = s._id; });
  allDrivers.forEach((d, i) => { map[`driver${i + 1}`] = d._id; });
  allUsers.forEach((u, i)  => { map[`rider${i + 1}`]   = u._id; });

  // schoolName → schoolId for linking drivers to schools
  const schoolNameMap = {};
  allSchools.forEach(s => { schoolNameMap[s.name] = s._id; });

  // Link drivers ↔ schools
  const linkUpdates = [];
  for (const d of drivers) {
    if (d.schoolName && schoolNameMap[d.schoolName]) {
      linkUpdates.push({
        updateOne: {
          filter: { vNumber: d.vNumber },
          update: { $addToSet: { schools: schoolNameMap[d.schoolName] } },
        },
      });
    }
  }
  if (linkUpdates.length) await Driver.bulkWrite(linkUpdates);

  // ── 3. Insert linked collections ───────────────────────────────

  function insertManyOr(model, docs, label) {
    if (!docs.length) return;
    model.insertMany(docs);
    console.log(`✅ ${label}: ${docs.length}`);
  }

  // Bookings
  const bookings = readSeed('bookings.json')
    .map(b => ({ ...resolve(b, map), createdAt: new Date(), updatedAt: new Date() }))
    .filter(Boolean);
  insertManyOr(Booking, bookings, 'Bookings');

  // Payments
  const payments = readSeed('payments.json')
    .map(p => ({ ...resolve(p, map), createdAt: new Date(), updatedAt: new Date() }))
    .filter(Boolean);
  insertManyOr(Payment, payments, 'Payments');

  // Chats
  const chatsRaw = readSeed('chats.json');
  for (const c of chatsRaw) {
    const resolved = resolve(c, map);
    if (!resolved) continue;
    resolved.participants = resolved.participants.map(toObjectId).filter(Boolean);
    resolved.messages = resolved.messages.map(m => ({
      ...m,
      sender: toObjectId(m.sender),
      timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
    })).filter(Boolean);
    if (resolved.lastMessage) {
      resolved.lastMessage.sender = toObjectId(resolved.lastMessage?.sender);
      resolved.lastMessage.timestamp = resolved.lastMessage.timestamp
        ? new Date(resolved.lastMessage.timestamp)
        : new Date();
    }
    resolved.booking = toObjectId(resolved.booking);
    const chat = new Chat({ ...resolved, createdAt: new Date(), updatedAt: new Date() });
    await chat.save();
  }
  console.log(`✅ Chats: ${chatsRaw.length}`);

  // Reviews
  const reviewsRaw = readSeed('reviews.json');
  for (const r of reviewsRaw) {
    const resolved = resolve(r, map);
    if (!resolved) continue;
    resolved.rider     = new mongoose.Types.ObjectId(resolved.rider);
    resolved.driver    = new mongoose.Types.ObjectId(resolved.driver);
    resolved.booking   = resolved.booking ? new mongoose.Types.ObjectId(resolved.booking) : null;
    const review = new Review({ ...resolved, createdAt: new Date(), updatedAt: new Date() });
    await review.save();
  }
  console.log(`✅ Reviews: ${reviewsRaw.length}`);

  // Search Histories
  const searchHistoriesRaw = readSeed('search-histories.json');
  for (const sh of searchHistoriesRaw) {
    const resolved = resolve(sh, map);
    if (!resolved) continue;
    resolved.user       = new mongoose.Types.ObjectId(resolved.user);
    resolved.bookedPlateNumber = resolved.bookedPlateNumber || null;
    const doc = new SearchHistory({ ...resolved, createdAt: new Date(), updatedAt: new Date() });
    await doc.save();
  }
  console.log(`✅ Search Histories: ${searchHistoriesRaw.length}`);

  // Trip Alerts
  const alertsRaw = readSeed('trip-alerts.json');
  for (const a of alertsRaw) {
    const resolved = resolve(a, map);
    if (!resolved) continue;
    resolved.user   = new mongoose.Types.ObjectId(resolved.user);
    resolved.driver = toObjectId(resolved.driver);
    resolved.booking = toObjectId(resolved.booking);
    const doc = new TripAlert({ ...resolved, createdAt: new Date(), updatedAt: new Date() });
    await doc.save();
  }
  console.log(`✅ Trip Alerts: ${alertsRaw.length}\n`);

  // ── Summary ────────────────────────────────────────────────────

  const counts = {
    Schools:        await School.countDocuments(),
    Drivers:        await Driver.countDocuments(),
    Users:          await User.countDocuments(),
    Bookings:       await Booking.countDocuments(),
    Payments:       await Payment.countDocuments(),
    Chats:          await Chat.countDocuments(),
    Reviews:        await Review.countDocuments(),
    SearchHistories:await SearchHistory.countDocuments(),
    TripAlerts:     await TripAlert.countDocuments(),
  };

  console.log('📊 Final counts:');
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  for (const [col, count] of Object.entries(counts)) {
    console.log(`   ${col.padEnd(18)} ${String(count).padStart(3)} `);
  }
  console.log(`   ${'TOTAL'.padEnd(18)} ${String(total).padStart(3)}\n`);

  console.log('🌱 Seed complete!\n');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
