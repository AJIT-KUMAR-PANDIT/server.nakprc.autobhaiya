# demo/db/seed — Seed Data

JSON seed files for Auto Bhaiya. Run the loader to populate your local MongoDB.

## Run

```bash
node demo/db/seed/seed.js
```

## Files

| File | Schema | Count | Source |
|---|---|---|---|
| `schools.json` | `School` | 10 | App CSV + extended (addresses, contacts) |
| `drivers.json` | `Driver` | 8 | `data.autobhaiya.nakprc.csv` + Rajesh Kumar default |
| `users.json` | `User` | 5 | Sample parents/students |
| `bookings.json` | `Booking` | 6 | 3 school-ride + 3 go-anywhere |
| `payments.json` | `Payment` | 5 | UPI & cash payments linked to bookings |
| `chats.json` | `Chat` | 4 | User↔driver DMs, support chat, alerts channel |
| `reviews.json` | `Review` | 5 | Ratings with category breakdowns |
| `search-histories.json` | `SearchHistory` | 7 | Query logs (school searches + go-anywhere) |
| `trip-alerts.json` | `TripAlert` | 8 | Notification events (driver-en-route, payment, etc.) |

## Placeholders

Other JSON files reference each other using `$` placeholders:

```json
{
  "booking": "$booking1",
  "rider": "$rider2",
  "driver": "$driver7"
}
```

These resolve during seed like so:

| Placeholder | Resolves To |
|---|---|
| `$school1`–`$school10` | School ObjectId (insertion order) |
| `$driver1`–`$driver8` | Driver ObjectId (insertion order) |
| `$rider1`–`$rider5` | User/ObjectId (insertion order) |
| `$booking1`–`$booking6` | Booking ObjectId (after bookings insert phase) |

The seed script inserts in dependency order: **schools → drivers → users → bookings → payments/chats/reviews/alerts**.
