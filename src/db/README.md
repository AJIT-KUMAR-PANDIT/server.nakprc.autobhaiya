# demo/db — MongoDB Schema & Seed Data

MongoDB (Mongoose) schemas for the **Auto Bhaiya** app, plus seed data to get you running locally.

## 📁 Structure

```
demo/db/
├── mongoose.js        # Connection helper
├── index.js           # Barrel exports
├── driver.schema.js   # Driver (auto bhaiya) profiles
├── school.schema.js   # School entities
├── user.schema.js     # Rider / parent accounts
├── booking.schema.js  # Ride bookings (school-ride & go-anywhere)
├── payment.schema.js  # Payment transactions
├── chat.schema.js     # Chat conversations (1:1 + system alerts)
├── review.schema.js   # Ratings & reviews
├── search-history.schema.js  # Server-side search tracking
├── trip-alert.schema.js        # Trip notifications/alerts
└── seed/              # Seed JSON data & loader script
    ├── schools.json
    ├── drivers.json
    ├── users.json
    ├── bookings.json
    ├── payments.json
    ├── chats.json
    ├── reviews.json
    ├── search-histories.json
    ├── trip-alerts.json
    └── seed.js        # Run this to populate MongoDB
```

## 🚀 Quick Start

```bash
# 1. Make sure MongoDB is running locally
mongod --dbpath <your-db-path>

# 2. Install mongoose (if not already installed)
npm install mongoose

# 3. Seed the database
node demo/db/seed/seed.js
```

## 📦 Usage in your backend

```js
const { connectDB, Driver, Booking } = require('./demo/db');

// Connect
await connectDB();

// Query
const drivers = await Driver.find({ status: 'available' });
const booking = await Booking.findOne({ vNumber: 'ABC-1234' }).populate('driver');
```

## 📋 Schema Summary

| Collection | Key Fields | Purpose |
|---|---|---|
| **Driver** | `vNumber`, `driverName`, `vehicleType`, `status`, `rating` | Auto-bhaiya profiles (mirrors CSV) |
| **School** | `name`, `city`, `location`, `drivers[]` | School entities with geospatial index |
| **User** | `phone`, `name`, `authMethod` | Rider / parent accounts |
| **Booking** | `rider`, `driver`, `type`, `status`, `isRecurring` | Core booking entity |
| **Payment** | `booking`, `amount`, `method`, `status` | Transaction records |
| **Chat** | `participants[]`, `messages[]`, `channelType` | WhatsApp-style conversations |
| **Review** | `rider`, `driver`, `rating(1-5)`, `categories` | Ratings & reviews per ride |
| **SearchHistory** | `user`, `query`, `isGoAnywhere` | Analytics on what users search for |
| **TripAlert** | `user`, `category`, `title`, `isRead` | Push-style notifications |

## 🔑 Key Indexes

- `Driver.vNumber` — unique lookup by plate number
- `Driver.lastLocation` (`2dsphere`) — "nearby drivers" for Go Anywhere
- `Driver(driverName, vehicleModel)` (text) — free-text search
- `School.location` (`2dsphere`) — schools near me
- `Booking(rider/createdAt)` — user booking history
- `Chat(participants/updatedAt)` — conversation list view

## 🌱 Seed Data

The seed directory contains:
- **schools.json** — All 10 schools (from the app's data + extended)
- **drivers.json** — 7 drivers from CSV + 1 default (Rajesh Kumar)
- **users.json** — 5 sample riders/parents
- **bookings.json** — 6 bookings (3 school rides, 3 go-anywhere trips)
- **payments.json** — 5 payment records linked to bookings
- **chats.json** — 4 conversations (2 user↔driver, 1 support, 1 alerts)
- **reviews.json** — 5 reviews across drivers
- **search-histories.json** — 7 search history entries
- **trip-alerts.json** — 8 trip notifications

Placeholders like `$school1`, `$driver7`, `$rider3` in the JSON files are automatically resolved to real ObjectIds when `seed.js` runs.

## ⚠️ Note

This is demo seed data — it drops and recreates the database every time. Only use for development / testing.
