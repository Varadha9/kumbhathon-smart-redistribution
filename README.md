# 🪔 KumbhAnna — Kumbh Mela Smart Food Network
### Real-Time Food Redistribution Platform for Kumbh Mela 2025 | Kumbhathon Project

> Connecting langar kitchens, temple camps, and NGOs across Prayagraj in real-time — eliminating food waste and feeding every pilgrim at the world's largest human gathering.

---

## 📌 Table of Contents

- [Problem Statement](#-problem-statement)
- [Solution Overview](#-solution-overview)
- [Live Demo Flow](#-live-demo-flow)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Architecture](#-architecture)
- [Smart Matching Engine](#-smart-matching-engine)
- [WhatsApp Integration](#-whatsapp-integration)
- [Volunteer Dispatch](#-volunteer-dispatch)
- [API Reference](#-api-reference)
- [Getting Started](#-getting-started)
- [Role-Based Access](#-role-based-access)
- [Kumbh Impact Metrics](#-kumbh-impact-metrics)
- [Socio-Economic Impact](#-socio-economic-impact)
- [Challenges & Limitations](#-challenges--limitations)
- [Future Enhancements](#-future-enhancements)

---

## 🚨 Problem Statement

During Kumbh Mela 2025 at Prayagraj:
- **5 crore+ pilgrims** gather across 40 sq km over 45 days
- **Hundreds of langar kitchens, temples, and NGO camps** cook food daily — with no coordination
- One zone has **500 surplus meals**, while 2 km away another camp can't feed 300 pilgrims
- Food expires within hours — wasted while people go hungry **in the same event**

**The gap:** No real-time system connects food surplus to food deficit across Kumbh Mela zones.

> A langar at Sangam Ghat cooks 800 plates. Triveni Bhandara 0.78 km away needs 600. Without KumbhAnna, that food is thrown away. With KumbhAnna, it reaches pilgrims in minutes.

---

## 💡 Solution Overview

**KumbhAnna** is a full-stack web platform purpose-built for Kumbh Mela:

1. **Camps/NGOs** sign up with their Kumbh Zone and GPS location, update food availability + pilgrim count
2. **Donors** (langars, temples, event kitchens) submit surplus food with GPS auto-detect
3. **Smart Matching Engine** detects surplus/deficit, prioritises same-zone transfers, applies time-of-day demand prediction, and generates transfer alerts
4. **NGOs confirm transfers** — WhatsApp alerts fire automatically to both camps
5. **Volunteers are dispatched** — assigned via the Volunteer tab, notified on WhatsApp with full pickup/delivery instructions
6. **Live impact tracked** — meals saved, CO₂ prevented, water saved, pilgrims served

---

## 📱 Live Demo Flow

```
Step 1:  Open app → Sign up as NGO (camp) or Donor (langar/kitchen)
Step 2:  Dashboard → Click "Load Kumbh Demo Data" → 6 real Prayagraj camp NGOs load
Step 3:  Dashboard → See live stats + camp table with Zone column + Food vs Pilgrim bar chart
Step 4:  Dashboard → Kumbh Impact Banner shows meals saved, CO₂, water, pilgrims served
Step 5:  Alerts tab → Smart Matching Engine shows zone-aware transfer suggestions
Step 6:  Alerts tab → See time-of-day demand prediction (Snan rush / Aarti time)
Step 7:  Alerts tab → Click "Confirm Transfer" → WhatsApp sent to both NGOs automatically
Step 8:  Alerts tab → Click "Assign Volunteer" → goes to Volunteer tab
Step 9:  Volunteer tab → Fill volunteer name + phone → Click "Dispatch Volunteer"
Step 10: Volunteer tab → WhatsApp sent to volunteer with pickup/delivery instructions
Step 11: Map tab → See green (surplus) and red (deficit) camp pins on Prayagraj map
Step 12: Donate tab (Donor role) → Submit food with GPS auto-detect → matched to nearest camp
Step 13: History tab → Full log of all transfers, donations, and impact summary
```

---

## ✨ Features

| Tab | Feature | Description |
|-----|---------|-------------|
| 🔐 Auth | Sign Up / Sign In | Role-based auth — NGO, Donor, Admin |
| 🔐 Auth | BCrypt Passwords | Passwords hashed with BCrypt — production-grade security |
| 🔐 Auth | Kumbh Zone Selection | NGOs select their Prayagraj zone during signup |
| 🔐 Auth | GPS Auto-detect | Auto-fill coordinates using browser location |
| 📊 Dashboard | Live Stats | Camps connected, food available, pilgrims to feed, meals redistributed |
| 📊 Dashboard | Kumbh Impact Banner | Live CO₂ saved, water saved, pilgrims served, zones active |
| 📊 Dashboard | Camp Table | All camps with Zone, food, pilgrim count, surplus/deficit status |
| 📊 Dashboard | Bar Chart | Food vs Pilgrim Need per camp |
| 🔔 Alerts | Zone-Aware Matching | Same-zone transfers prioritised — faster logistics within Kumbh sectors |
| 🔔 Alerts | Demand Prediction | Time-of-day multiplier — Snan rush (4–7am), Aarti peak (5–8pm) |
| 🔔 Alerts | Urgency Levels | CRITICAL / HIGH / MEDIUM based on deficit size |
| 🔔 Alerts | WhatsApp on Confirm | Auto-sends WhatsApp to both NGOs when transfer is confirmed |
| 🔔 Alerts | Assign Volunteer | One-click to jump to Volunteer dispatch tab |
| 🍛 Donate | Food Submission | Submit surplus food with quantity, type, expiry window |
| 🍛 Donate | GPS Auto-detect | Auto-fills lat/lng using browser location |
| 🍛 Donate | Auto-matching | Instantly matched to nearest deficit camp |
| 🍛 Donate | WhatsApp on Match | Matched NGO gets WhatsApp notification automatically |
| 🗺️ Map | Live Prayagraj Map | OpenStreetMap centred on Sangam Ghat |
| 🗺️ Map | Color Coding | Green = surplus, Red = deficit |
| 🗺️ Map | Zone Popups | Click marker to see zone, food, pilgrim data |
| 🚴 Volunteer | Assign Volunteer | Assign volunteer name + phone to any confirmed transfer |
| 🚴 Volunteer | WhatsApp Dispatch | Volunteer gets full pickup + delivery instructions on WhatsApp |
| 🚴 Volunteer | Live Dispatch Board | Real-time board showing all active and delivered assignments |
| 🚴 Volunteer | Mark Delivered | One-click to mark a delivery as complete |
| 📋 History | Transfer Log | All confirmed transfers with timestamps |
| 📋 History | Donation Log | All donations with matched camp |
| 📋 History | Impact Summary | Total meals redistributed, transfers done, donations received |
| 🏢 Register | Add Camp/NGO | Register new camps with zone + GPS (admin only) |
| 🏢 Register | Update Food Data | Update food stock and pilgrim count anytime |

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| Java 17+ | Core language |
| Spring Boot 3.3 | REST API framework |
| Spring Security | BCrypt password hashing, CORS config |
| Spring Data JPA | ORM layer for H2 persistence |
| H2 Database | File-based embedded DB — survives restarts |
| Twilio SDK 10.x | WhatsApp notifications to NGOs and volunteers |
| Maven | Build and dependency management |

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 19 + Vite | UI framework + lightning-fast dev server |
| Recharts | Bar charts and data visualization |
| Leaflet + React-Leaflet | Interactive map with camp markers |
| OpenStreetMap | Free map tiles — no API key needed |
| Inter (Google Fonts) | Clean modern typography |
| CSS3 | Custom styling, responsive layout, saffron Kumbh theme |

### Integrations
| Technology | Purpose |
|-----------|---------|
| Twilio WhatsApp API | Real-time WhatsApp alerts to NGOs and volunteers |
| Browser Geolocation API | GPS auto-detect for NGO signup and food donation |
| localStorage | Persist login session across page refreshes |

---

## 📁 Project Structure

```
kumbhathon-smart-redistribution/
│
├── backend/                                          # Spring Boot Backend
│   ├── pom.xml                                       # Maven build — Spring Boot 3.3, Twilio, Security
│   └── src/main/
│       ├── resources/
│       │   └── application.properties                # Port 8080, Twilio credentials config
│       └── java/com/kumbhanna/redistribution/
│           ├── KumbhAnnaApplication.java             # @SpringBootApplication entry point
│           ├── config/
│           │   └── SecurityConfig.java               # CORS for React:3000, BCrypt bean, permit all
│           ├── model/
│           │   ├── Ngo.java                          # NGO/camp data model
│           │   ├── User.java                         # User model (BCrypt hashed password)
│           │   ├── Transfer.java                     # Confirmed transfer record
│           │   ├── Donation.java                     # Food donation record
│           │   ├── Alert.java                        # Smart matching result
│           │   └── VolunteerAssignment.java          # Volunteer dispatch record
│           ├── service/
│           │   ├── DataStore.java                    # In-memory ConcurrentHashMap store
│           │   ├── MatchingService.java              # Haversine + zone-aware matching + demand prediction
│           │   └── WhatsAppService.java              # Twilio WhatsApp (graceful no-op if unconfigured)
│           └── controller/
│               ├── AuthController.java               # POST /api/auth/signup, /api/auth/signin
│               ├── NgoController.java                # NGOs, alerts, stats, impact, seed
│               ├── TransferController.java           # Transfer confirm, donate, history
│               └── VolunteerController.java          # Volunteer assign, list, complete, notify
│
├── frontend/                                         # React Frontend
│   ├── public/
│   │   └── index.html                               # HTML entry point
│   └── src/
│       ├── components/
│       │   ├── Auth.js                              # Login + Signup with Kumbh Zone selection
│       │   ├── Dashboard.js                         # Stats + Impact Banner + camp table + chart
│       │   ├── Alerts.js                            # Zone-aware alerts + demand prediction + WhatsApp
│       │   ├── Donate.js                            # Food donation form with GPS auto-detect
│       │   ├── NGOMap.js                            # Leaflet map centred on Prayagraj
│       │   ├── RegisterNGO.js                       # Register camp + update food data
│       │   ├── History.js                           # Transfer and donation history
│       │   └── Volunteer.js                         # Volunteer dispatch + live board
│       ├── api.js                                   # Shared fetch utility → localhost:8080
│       ├── App.js                                   # Auth state, tab nav, role-based access, setTab context
│       ├── App.css                                  # Global styles — saffron Kumbh theme
│       └── index.js                                 # React entry point
│
├── start.sh                                          # One-click Linux/Mac startup script
├── start.bat                                         # One-click Windows startup script
└── README.md                                         # This file
```

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     React Frontend                           │
│                    (localhost:3000)                          │
│                                                              │
│  Auth | Dashboard | Alerts | Donate | Map | Volunteer |      │
│  History | Register                                          │
└─────────────────────────┬────────────────────────────────────┘
                          │ REST API (JSON) — port 8080
                          ▼
┌──────────────────────────────────────────────────────────────┐
│                  Spring Boot Backend                         │
│                    (localhost:8080)                          │
│                                                              │
│  AuthController      NgoController      TransferController   │
│  VolunteerController                                         │
│                                                              │
│  /api/auth/signup       /api/auth/signin                     │
│  /api/ngos              /api/ngo/register  /api/ngo/update   │
│  /api/alerts            /api/stats         /api/impact       │
│  /api/donate            /api/transfer/confirm                │
│  /api/history/transfers /api/history/donations               │
│  /api/volunteer/assign  /api/volunteer/list                  │
│  /api/volunteer/complete /api/seed                           │
└──────────┬───────────────────────┬───────────────────────────┘
           │                       │
    ┌──────▼──────┐       ┌────────▼────────────┐
    │  DataStore  │       │   MatchingService   │
    │             │       │                     │
    │ ConcurrentH │       │ - Haversine dist    │
    │ ashMap NGOs │       │ - Zone-aware match  │
    │ users       │       │ - Demand prediction │
    │ transfers   │       │ - Urgency scoring   │
    │ donations   │       └────────┬────────────┘
    │ volunteers  │                │
    └─────────────┘       ┌────────▼────────────┐
                          │  WhatsAppService    │
                          │                     │
                          │  Twilio SDK         │
                          │  → NGO alerts       │
                          │  → Volunteer SMS    │
                          └─────────────────────┘
```

---

## 🧠 Smart Matching Engine

The core logic lives in `MatchingService.java`.

### Step 1 — Classify Camps
```java
List<Ngo> surplus = ngos.stream()
    .filter(n -> n.getFoodAvailable() > n.getPeopleCount())
    .collect(Collectors.toList());

List<Ngo> deficit = ngos.stream()
    .filter(n -> n.getFoodAvailable() < n.getPeopleCount())
    .collect(Collectors.toList());
```

### Step 2 — Time-of-Day Demand Prediction
```java
int hour = LocalTime.now().getHour();
if (hour >= 4 && hour < 7)  return new Object[]{1.8, "Early morning Snan rush"};
if (hour >= 17 && hour < 20) return new Object[]{1.6, "Evening Aarti time"};
```
Demand multiplier is applied to deficit estimates — so alerts are more aggressive during peak pilgrim hours.

### Step 3 — Zone-Aware Matching (Pass 1: Same Zone)
```java
// Prefer same Kumbh zone — faster logistics, shorter distance
for (Ngo s : surplus) {
    boolean isZoneMatch = d.getKumbhZone().equals(s.getKumbhZone());
    if (isZoneMatch && dist < bestDist) { best = s; sameZone = true; }
}
```

### Step 4 — Nearest Cross-Zone Fallback (Pass 2)
```java
// If no same-zone surplus, find nearest regardless of zone
if (best == null) {
    best = surplus.stream()
        .min(Comparator.comparingDouble(s -> haversine(...)))
        .orElse(null);
}
```

### Step 5 — Urgency Scoring
```java
String urgency = rawDeficit > 300 ? "CRITICAL" : rawDeficit > 100 ? "HIGH" : "MEDIUM";
```

### Example Alert Response
```json
{
  "from": "Sangam Seva Samiti",
  "to": "Triveni Bhandara",
  "mealsToTransfer": 500,
  "distanceKm": 0.78,
  "urgency": "CRITICAL",
  "sameZone": true,
  "demandReason": "🌅 Early morning Snan rush — HIGH pilgrim activity",
  "fromZone": "Zone A - Sangam",
  "toZone": "Zone A - Sangam"
}
```

---

## 📱 WhatsApp Integration

KumbhAnna uses **Twilio WhatsApp API** to send real-time notifications. Three trigger points:

| Event | Who gets WhatsApp | Message |
|-------|------------------|---------|
| Donation matched | Matched NGO/camp | Donor name, quantity, food type, expiry window |
| Transfer confirmed | Both NGOs | Meals count, partner camp name, zone, distance |
| Volunteer dispatched | Volunteer + receiving NGO | Full pickup address, delivery address, quantity |

### Setup (5 minutes)
1. Sign up free at [twilio.com](https://www.twilio.com/try-twilio)
2. Enable WhatsApp Sandbox at Twilio Console → Messaging → Try it out → Send a WhatsApp message
3. Add credentials to `backend/src/main/resources/application.properties`:
```properties
twilio.account-sid=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
twilio.auth-token=your_auth_token_here
twilio.whatsapp-from=whatsapp:+14155238886
```
4. Restart backend — WhatsApp activates automatically

> If credentials are not set, the app runs normally in demo mode — WhatsApp calls are silently skipped.

---

## 🚴 Volunteer Dispatch

The Volunteer tab solves the **last-mile logistics problem** — the biggest gap in food redistribution.

**Flow:**
1. NGO confirms a transfer in the Alerts tab
2. "Assign Volunteer" button appears → click to go to Volunteer tab
3. Select the confirmed transfer from dropdown (auto-fills from/to/meals)
4. Enter volunteer name + WhatsApp number
5. Click "Dispatch Volunteer"
6. Volunteer receives WhatsApp with full pickup + delivery instructions
7. Receiving NGO gets WhatsApp: "Volunteer is on the way"
8. Live Dispatch Board shows all active assignments
9. Click "Mark Delivered" when food arrives

---

## 🔐 Role-Based Access

| Tab | Donor | NGO | Admin |
|-----|-------|-----|-------|
| Dashboard | ✅ | ✅ | ✅ |
| Alerts | ❌ | ✅ | ✅ |
| Donate | ✅ | ❌ | ✅ |
| Map | ✅ | ✅ | ✅ |
| Volunteer | ❌ | ✅ | ✅ |
| History | ✅ | ✅ | ✅ |
| Register NGO | ❌ | ❌ | ✅ |

---

## 📡 API Reference

### Base URL: `http://localhost:8080/api`

| Method | Endpoint | Description |
|--------|---------|-------------|
| `POST` | `/auth/signup` | Create account — role: ngo / donor / admin |
| `POST` | `/auth/signin` | Login with email + password |
| `GET` | `/ngos` | List all registered camps/NGOs |
| `GET` | `/alerts` | Get zone-aware smart matching alerts |
| `GET` | `/stats` | Platform-wide statistics |
| `GET` | `/impact` | Kumbh impact metrics (CO₂, water, pilgrims) |
| `POST` | `/ngo/register` | Register a new camp/NGO |
| `POST` | `/ngo/update` | Update food stock + pilgrim count |
| `POST` | `/donate` | Submit food donation — auto-matched to nearest camp |
| `POST` | `/transfer/confirm` | Confirm transfer — fires WhatsApp to both NGOs |
| `GET` | `/history/transfers` | All confirmed transfers |
| `GET` | `/history/donations` | All submitted donations |
| `POST` | `/volunteer/assign` | Assign volunteer — fires WhatsApp to volunteer + NGO |
| `GET` | `/volunteer/list` | All volunteer assignments |
| `POST` | `/volunteer/complete` | Mark delivery as done |
| `POST` | `/seed` | Load 6 Prayagraj demo camps |

### Sample — Sign Up as NGO
```bash
curl -X POST http://localhost:8080/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sangam Seva Samiti",
    "email": "sangam@ngo.com",
    "password": "secure123",
    "role": "ngo",
    "location": "Sangam Ghat, Prayagraj",
    "kumbh_zone": "Zone A - Sangam",
    "latitude": 25.4358,
    "longitude": 81.8463,
    "contact": "9800000001"
  }'
```

### Sample — Get Alerts Response
```json
[
  {
    "from": "Sangam Seva Samiti",
    "to": "Triveni Bhandara",
    "mealsToTransfer": 500,
    "distanceKm": 0.78,
    "urgency": "CRITICAL",
    "sameZone": true,
    "demandReason": "🌅 Early morning Snan rush — HIGH pilgrim activity",
    "fromZone": "Zone A - Sangam",
    "toZone": "Zone A - Sangam"
  }
]
```

---

## 🚀 Getting Started

### Prerequisites
- Java 17+
- Maven 3.6+
- Node.js 18+
- npm

### Option 1: One-Click (Linux/Mac)
```bash
chmod +x start.sh
./start.sh
```

### Option 2: Manual

**Backend**
```bash
cd backend
mvn spring-boot:run
```
Backend runs at → `http://localhost:8080`
H2 Console at → `http://localhost:8080/h2-console`

**Frontend** (separate terminal)
```bash
cd frontend
npm install
npm run start
```
Frontend runs at → `http://localhost:3000`

### Default Admin Login
- Email: `admin@kumbhanna.in`
- Password: `admin123`

---

## 📊 Kumbh Impact Metrics

KumbhAnna tracks real environmental and social impact at `/api/impact`:

| Metric | Calculation | Why it matters |
|--------|------------|----------------|
| Meals saved | Sum of all confirmed transfers | Direct hunger reduction |
| CO₂ prevented | meals × 0.5 kg | Food waste = methane in landfills |
| Water saved | meals × 200 litres | Water embedded in food production |
| Pilgrims served | meals × 1.2 | Average pilgrims fed per meal |
| Zones active | Distinct Kumbh zones with NGOs | Network coverage across Prayagraj |

---

## 🌱 Socio-Economic Impact

### Social Impact
- **Hunger Reduction at Scale** — 5 crore pilgrims, coordinated food network across all zones
- **NGO Collaboration** — Breaks silos between isolated camp kitchens
- **Faster Response** — Critical during Shahi Snan days when crowd density spikes 10x
- **Volunteer Empowerment** — Structured dispatch system for last-mile delivery

### Economic Impact
- **Reduces Food Waste Costs** — Langars and temples save money on disposal
- **Optimised Transport** — Zone-aware matching minimises fuel cost and delivery time
- **Scalable Model** — City → State → National level with government/CSR integration

### Environmental Impact
- **Less Food in Landfills** — Reduces methane emissions from decomposing food
- **Shorter Routes** — Zone-first matching = lower carbon footprint
- **UN SDG Alignment** — SDG 2 (Zero Hunger), SDG 12 (Responsible Consumption), SDG 13 (Climate Action)

---

## ⚠️ Challenges & Limitations

| Challenge | Current State | Future Fix |
|-----------|--------------|------------|
| In-Memory Storage | H2 file DB — persists across restarts | PostgreSQL for production |
| Internet Dependency | Requires connectivity | Offline-first PWA / SMS fallback |
| Food Quality | No verification of food safety | Photo upload + quality checklist |
| IoT Integration | Manual food count updates | Smart containers with weight sensors |
| Route Optimisation | Straight-line distance only | Google Maps / OSRM road routing |
| Multi-language | English only | Hindi, Marathi for wider NGO adoption |

---

## 🔮 Future Enhancements

- [ ] **JPA + PostgreSQL** — Persistent database, survives server restarts
- [ ] **Push Notifications** — Browser/mobile alerts for NGOs
- [ ] **IoT Sensor Integration** — Auto-detect food quantity via smart containers
- [ ] **Government API** — Connect with PDS and mid-day meal schemes
- [ ] **Flutter Mobile App** — Android/iOS for NGO volunteers on the ground
- [ ] **Road-based Routing** — OSRM integration for actual travel distance/time
- [ ] **Analytics Dashboard** — Zone-wise hunger maps, daily/weekly reports
- [ ] **Multi-language** — Hindi, Marathi, Tamil support
- [ ] **WhatsApp Bot** — NGOs update food data by sending a WhatsApp message
- [ ] **Crowd Density API** — Auto-flag high-need zones during Shahi Snan days

---

## 🙏 Acknowledgements

- **Kumbhathon** — For the platform and opportunity to build for social good
- **OpenStreetMap** — Free map tiles
- **Leaflet.js** — Open-source interactive map library
- **Recharts** — React chart library
- **Twilio** — WhatsApp API for real-time notifications
- Inspired by: **Feeding India**, **No Food Waste**, **Too Good To Go**

---

<div align="center">
  <strong>🪔 KumbhAnna — Built for Kumbhathon 2025</strong><br/>
  Feeding every pilgrim at Kumbh Mela, one meal at a time 🍛
</div>
