# 🪔 KumbhAnna — Workflow & Data Flows

> How every user action flows through KumbhAnna — from button click to database update to WhatsApp notification.

---

## 📌 Table of Contents

- [How the App Starts](#-how-the-app-starts)
- [User Roles & What They See](#-user-roles--what-they-see)
- [Complete User Workflows](#-complete-user-workflows)
- [Smart Matching Engine — Step by Step](#-smart-matching-engine--step-by-step)
- [WhatsApp Notification Flow](#-whatsapp-notification-flow)
- [Volunteer Dispatch Flow](#-volunteer-dispatch-flow)
- [State Management in React](#-state-management-in-react)
- [Data Models](#-data-models)
- [API Contract — Every Endpoint](#-api-contract--every-endpoint)
- [Running the Project](#-running-the-project)

---

## 🚀 How the App Starts

### Backend startup sequence
```
1. KumbhAnnaApplication.main() runs
2. Spring Boot auto-configures:
   - Embedded Tomcat on port 8080
   - Jackson JSON serializer (camelCase ↔ JSON)
   - Spring Security filter chain (SecurityConfig)
3. SecurityConfig registers:
   - CORS: allow http://localhost:3000
   - All /api/** routes: permitAll (no JWT needed for demo)
   - BCryptPasswordEncoder bean
4. WhatsAppService @PostConstruct:
   - Reads twilio.account-sid from application.properties
   - If starts with "AC" and token is not placeholder → Twilio.init()
   - Otherwise: enabled = false (silent demo mode)
5. DataStore initialised as empty ConcurrentHashMaps
6. Server ready — listening on :8080
```

### Frontend startup sequence
```
1. npm start → webpack dev server on port 3000
2. index.js → ReactDOM.render(<App />)
3. App.js:
   - Reads user from localStorage (persist login across refresh)
   - Fetches http://localhost:8080/api/stats to check backend connectivity
   - Shows green "Connected" banner or red "Backend offline" banner
   - If no user in localStorage → renders <Auth /> login screen
   - If user exists → renders tab navigation filtered by user.role
```

---

## 👥 User Roles & What They See

```
┌─────────────────────────────────────────────────────────────┐
│  Role: DONOR (langar, temple kitchen, event organiser)      │
│  Tabs: Dashboard | Donate | Map | History                   │
│  Can: Submit food donations, see map, see history           │
│  Cannot: See alerts, confirm transfers, assign volunteers   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Role: NGO (camp, bhandara, pilgrim service organisation)   │
│  Tabs: Dashboard | Alerts | Map | Volunteer | History       │
│  Can: See alerts, confirm transfers, assign volunteers,     │
│       update food data                                      │
│  Cannot: Submit donations, register new NGOs                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Role: ADMIN (platform operator)                            │
│  Tabs: All tabs including Register                          │
│  Can: Everything — register NGOs, full access               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Complete User Workflows

### Workflow 1 — NGO Signs Up and Gets Matched

```
User opens app
    │
    ▼
Auth.js → Sign Up → Role: NGO
    │  Fills: name, email, password, location, Kumbh Zone
    │  Clicks "Auto-detect My Location" → browser GPS fills lat/lng
    │
    ▼
POST /api/auth/signup
    │  Spring: BCrypt.encode(password) → store in DataStore.users
    │  Also creates NGO entry in DataStore.ngos with food=0, people=0
    │
    ▼
App.js → handleLogin(user) → setTab("Dashboard")
    │
    ▼
Dashboard.js loads
    │  GET /api/stats + GET /api/ngos + GET /api/impact (parallel)
    │
    ▼
NGO clicks "Load Kumbh Demo Data"
    │  POST /api/seed → 6 Prayagraj camps loaded into DataStore.ngos
    │
    ▼
Dashboard shows:
    - 6 camps in table with Zone column
    - Bar chart: Food vs Pilgrim Need
    - Stats cards update
    │
    ▼
NGO goes to Alerts tab
    │  GET /api/alerts → MatchingService.computeAlerts()
    │  Returns zone-aware suggestions sorted by distance
    │
    ▼
NGO clicks "Confirm Transfer"
    │  POST /api/transfer/confirm
    │  Spring: updates food counts for both NGOs
    │  Spring: WhatsAppService.send() to both NGO contacts
    │  triggerRefresh() → Dashboard stats update
    │
    ▼
"Assign Volunteer" button appears
    │  setTab("Volunteer") → navigates to Volunteer tab
```

### Workflow 2 — Donor Submits Food

```
Donor logs in → goes to Donate tab
    │
    ▼
Donate.js form:
    - Donor name, food quantity, food type, expiry hours
    - Clicks "Auto-detect" → browser GPS fills lat/lng
    │
    ▼
POST /api/donate
    │  Spring: finds all deficit NGOs (food < people)
    │  Spring: haversine() to find nearest deficit NGO to donor GPS
    │  Spring: sets donation.matchedNgo = nearest.ngoName
    │  Spring: WhatsAppService.send() to matched NGO contact
    │
    ▼
Success message: "Matched with: Triveni Bhandara"
    │
    ▼
History tab → Donations log shows new entry with matched NGO
```

### Workflow 3 — Volunteer Dispatch

```
NGO confirms transfer in Alerts tab
    │
    ▼
Clicks "Assign Volunteer" → Volunteer tab
    │
    ▼
Volunteer.js:
    - Dropdown: select confirmed transfer (auto-fills from/to/meals)
    - Enter volunteer name + WhatsApp phone number
    - Click "Dispatch Volunteer"
    │
    ▼
POST /api/volunteer/assign
    │  Spring: creates VolunteerAssignment in DataStore.volunteers
    │  Spring: WhatsApp to volunteer:
    │    "Pickup: Sangam Seva Samiti, Sangam Ghat (Zone A)
    │     Deliver to: Triveni Bhandara, Triveni Ghat (Zone A)
    │     Quantity: 200 meals"
    │  Spring: WhatsApp to receiving NGO:
    │    "Volunteer Ramesh Kumar is on the way with 200 meals"
    │
    ▼
Live Dispatch Board updates:
    - Shows "🔄 En Route" card for Ramesh Kumar
    - Shows from → to route, meal count, phone, timestamp
    │
    ▼
When food arrives → click "Mark Delivered"
    │  POST /api/volunteer/complete { id: 1 }
    │  Card turns green: "✅ Delivered"
```

---

## 🧠 Smart Matching Engine — Step by Step

```
Input: List<Ngo> allNgos

Step 1: Get demand multiplier
        hour = LocalTime.now().getHour()
        ┌─────────────────────────────────────┐
        │ 04-07h → 1.8x  Snan rush            │
        │ 07-10h → 1.5x  Morning meal peak     │
        │ 11-14h → 1.3x  Midday rush           │
        │ 17-20h → 1.6x  Aarti time            │
        │ 20-23h → 1.2x  Night distribution    │
        │ else   → 0.9x  Low activity          │
        └─────────────────────────────────────┘

Step 2: Split into surplus and deficit lists

Step 3: For each deficit NGO:
        a. effectiveNeed = (people - food) × multiplier
        b. Pass 1 — scan surplus list for same kumbhZone:
              dist = haversine(deficit.lat, deficit.lng, surplus.lat, surplus.lng)
              if dist < bestDist → update best, sameZone = true
        c. Pass 2 — if no same-zone found, scan all surplus for nearest:
              dist = haversine(...)
              if dist < bestDist → update best, sameZone = false
        d. transfer = min(surplus can give, deficit needs)
        e. urgency = CRITICAL if rawDeficit > 300
                     HIGH     if rawDeficit > 100
                     MEDIUM   otherwise

Step 4: Sort alerts by distanceKm ascending
        (closest transfers appear first — fastest to execute)

Output: List<Alert> sorted by distance
```

---

## 📱 WhatsApp Notification Flow

```
Event: Transfer Confirmed
       │
       ├── WhatsApp to SENDER NGO (fromNgo.contact):
       │   "Prepare X meals for dispatch to [toNgo] ([zone]). Distance: Y km."
       │
       └── WhatsApp to RECEIVER NGO (toNgo.contact):
           "X meals are being sent from [fromNgo] ([zone]). Volunteer coming."

Event: Donation Matched
       │
       └── WhatsApp to MATCHED NGO (nearest.contact):
           "New donation: X plates from [donor]. Use within Y hours."

Event: Volunteer Dispatched
       │
       ├── WhatsApp to VOLUNTEER (volunteerPhone):
       │   "Pickup: [fromNgo], [location] ([zone])
       │    Deliver to: [toNgo], [location] ([zone])
       │    Quantity: X meals. Proceed immediately."
       │
       └── WhatsApp to RECEIVING NGO (toNgo.contact):
           "Volunteer [name] is on the way with X meals. Contact: [phone]"
```

All WhatsApp calls go through `WhatsAppService.send()` which:
1. Validates phone number (min 10 digits)
2. Formats as `whatsapp:+91XXXXXXXXXX`
3. Calls `Twilio Message.creator().create()`
4. Catches any exception silently — app never crashes due to WhatsApp failure

---

## 🚴 Volunteer Dispatch Flow

```
Frontend                          Backend
   │                                 │
   │  GET /history/transfers         │
   │ ──────────────────────────────► │ Returns all confirmed transfers
   │ ◄────────────────────────────── │
   │                                 │
   │  User selects transfer #1       │
   │  Auto-fills: from, to, meals    │
   │  Enters: volunteer name, phone  │
   │                                 │
   │  POST /volunteer/assign         │
   │ ──────────────────────────────► │ Creates VolunteerAssignment
   │                                 │ WhatsApp → volunteer
   │                                 │ WhatsApp → receiving NGO
   │ ◄────────────────────────────── │ Returns assignment + twilio_enabled
   │                                 │
   │  GET /volunteer/list            │
   │ ──────────────────────────────► │ Returns all assignments
   │ ◄────────────────────────────── │
   │                                 │
   │  Dispatch board renders         │
   │  "🔄 En Route" card             │
   │                                 │
   │  POST /volunteer/complete       │
   │ ──────────────────────────────► │ Sets status = "delivered"
   │ ◄────────────────────────────── │ Sets deliveredAt timestamp
   │                                 │
   │  Card turns green "✅ Delivered" │
```

---

## 🔄 State Management in React

KumbhAnna uses React's built-in Context API — no Redux needed.

```
AppContext provides:
  ├── user          — logged-in user object (name, email, role)
  ├── showToast(msg, type) — shows bottom-right toast for 3 seconds
  ├── triggerRefresh()     — increments refresh counter
  ├── refresh              — number, child components useEffect on this
  └── setTab(tabName)      — navigate to any tab programmatically

Usage in any component:
  const { showToast, triggerRefresh, refresh, user, setTab } = useApp();
```

**Refresh pattern** — how data stays in sync:
```
User confirms transfer in Alerts.js
    → api.post("/transfer/confirm")
    → triggerRefresh()                    ← increments App.js refresh state
    → Dashboard.js useEffect([refresh])   ← re-fetches /stats and /ngos
    → Stats cards update automatically
```

---

## 📦 Data Models

### Ngo
```json
{
  "ngoName":       "Sangam Seva Samiti",
  "location":      "Sangam Ghat, Prayagraj",
  "kumbhZone":     "Zone A - Sangam",
  "latitude":      25.4358,
  "longitude":     81.8463,
  "contact":       "9800000001",
  "foodAvailable": 800,
  "peopleCount":   300,
  "timestamp":     "2025-01-14T10:30:00"
}
```

### Alert (Smart Matching Output)
```json
{
  "from":            "Sangam Seva Samiti",
  "to":              "Triveni Bhandara",
  "mealsToTransfer": 500,
  "distanceKm":      0.78,
  "urgency":         "CRITICAL",
  "sameZone":        true,
  "demandReason":    "🌅 Early morning Snan rush — HIGH pilgrim activity",
  "fromZone":        "Zone A - Sangam",
  "toZone":          "Zone A - Sangam"
}
```

### VolunteerAssignment
```json
{
  "id":             1,
  "volunteerName":  "Ramesh Kumar",
  "volunteerPhone": "9800011111",
  "fromNgo":        "Sangam Seva Samiti",
  "toNgo":          "Triveni Bhandara",
  "meals":          200,
  "status":         "dispatched",
  "timestamp":      "2025-01-14T10:35:00",
  "deliveredAt":    null
}
```

### Impact Response
```json
{
  "meals_saved_at_kumbh": 1200,
  "zones_covered":        3,
  "co2_saved_kg":         600.0,
  "water_saved_litres":   240000,
  "pilgrims_served":      1440
}
```

---

## 📡 API Contract — Every Endpoint

### Auth

**POST /api/auth/signup**
```json
Request:  { "name": "...", "email": "...", "password": "...", "role": "ngo|donor|admin",
            "location": "...", "kumbh_zone": "...", "latitude": 0.0, "longitude": 0.0, "contact": "..." }
Response: 201 { "message": "Signup successful", "user": { name, email, role, contact } }
Errors:   400 Missing fields | 409 Email already registered
```

**POST /api/auth/signin**
```json
Request:  { "email": "...", "password": "..." }
Response: 200 { "message": "Login successful", "user": { name, email, role, contact } }
Errors:   401 Invalid email or password
```

### NGO

**GET /api/ngos** → `200 List<Ngo>`

**POST /api/ngo/register**
```json
Request:  { "ngo_name": "...", "location": "...", "kumbh_zone": "...",
            "latitude": 0.0, "longitude": 0.0, "contact": "..." }
Response: 200 { "message": "NGO registered", "ngo": Ngo }
```

**POST /api/ngo/update**
```json
Request:  { "ngo_name": "...", "food_available": 500, "people_count": 300 }
Response: 200 { "message": "Updated", "ngo": Ngo }
Errors:   404 NGO not found
```

**GET /api/alerts** → `200 List<Alert>` (empty if < 2 NGOs)

**GET /api/stats**
```json
Response: { "total_ngos": 6, "total_food_available": 2710, "total_people_to_feed": 2200,
            "meals_redistributed": 500, "active_donations": 1, "completed_transfers": 2 }
```

**GET /api/impact**
```json
Response: { "meals_saved_at_kumbh": 500, "zones_covered": 3,
            "co2_saved_kg": 250.0, "water_saved_litres": 100000, "pilgrims_served": 600 }
```

**POST /api/seed** → `200 { "message": "Kumbh demo data loaded", "count": 6 }`

### Transfer & Donation

**POST /api/transfer/confirm**
```json
Request:  { "from": "...", "to": "...", "meals_to_transfer": 200,
            "distance_km": 0.78, "urgency": "CRITICAL" }
Response: { "message": "Transfer confirmed", "transfer": Transfer,
            "whatsapp": { "twilio_enabled": false } }
```

**POST /api/donate**
```json
Request:  { "donor_name": "...", "food_quantity": 100, "food_type": "Veg",
            "latitude": 25.4358, "longitude": 81.8463, "expiry_hours": 3 }
Response: Donation (with matchedNgo filled if deficit NGO found)
```

**GET /api/history/transfers** → `200 List<Transfer>`

**GET /api/history/donations** → `200 List<Donation>`

### Volunteer

**POST /api/volunteer/assign**
```json
Request:  { "volunteer_name": "...", "volunteer_phone": "...",
            "from_ngo": "...", "to_ngo": "...", "meals": 200 }
Response: { "message": "Volunteer assigned", "assignment": VolunteerAssignment,
            "twilio_enabled": false }
```

**GET /api/volunteer/list** → `200 List<VolunteerAssignment>`

**POST /api/volunteer/complete**
```json
Request:  { "id": 1 }
Response: { "message": "Marked as delivered", "assignment": VolunteerAssignment }
Errors:   404 Assignment not found
```

---

## 🏃 Running the Project

```bash
# Navigate to project
cd kumbhathon-smart-redistribution

# Option 1: One-click
chmod +x start.sh && ./start.sh

# Option 2: Manual
# Terminal 1 — Backend
cd backend && mvn spring-boot:run

# Terminal 2 — Frontend
cd frontend && npm install && npm start

# Option 3: JAR
cd backend
mvn package -DskipTests
java -jar target/redistribution-1.0.0.jar
```

**URLs:**
- Frontend → http://localhost:3000
- Backend API → http://localhost:8080/api
- Health check → http://localhost:8080/api/stats

---

<div align="center">
  <strong>🪔 KumbhAnna — Kumbhathon 2025</strong><br/>
  Built with Java + React for the world's largest human gathering
</div>
