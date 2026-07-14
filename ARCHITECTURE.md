# 🏗️ KumbhAnna — Architecture & System Design

> System structure, component diagrams, backend layers, security design, and environment configuration for KumbhAnna.

---

## 📌 Table of Contents

- [Full Project Structure](#-full-project-structure)
- [High-Level System Overview](#-high-level-system-overview)
- [Layered Backend Architecture](#-layered-backend-architecture)
- [Frontend Component Architecture](#-frontend-component-architecture)
- [Request-Response Lifecycle](#-request-response-lifecycle)
- [Smart Matching Engine Architecture](#-smart-matching-engine-architecture)
- [WhatsApp Architecture](#-whatsapp-architecture)
- [Full System Data Flow](#-full-system-data-flow)
- [Security Design](#-security-design)
- [Environment Configuration](#-environment-configuration)

---

## 📁 Full Project Structure

```
kumbhathon-smart-redistribution/
│
├── 📄 README.md                          ← Main project README (problem, features, setup)
├── 📄 WORKFLOW.md                        ← User flows, data flows, API contract
├── 📄 ARCHITECTURE.md                   ← This file — system design & structure
├── 🖥️  start.sh                          ← One-click Linux/Mac startup
├── 🖥️  start.bat                         ← One-click Windows startup
│
├── 🟦 backend/                           ← Spring Boot REST API (Java 17, Maven)
│   ├── 📄 pom.xml                        ← Maven dependencies: Spring Boot 3.3, Security, Twilio
│   └── src/
│       └── main/
│           ├── resources/
│           │   └── application.properties ← Port 8080, Twilio credentials
│           └── java/com/kumbhanna/redistribution/
│               │
│               ├── 🚀 KumbhAnnaApplication.java     ← Entry point — @SpringBootApplication
│               │
│               ├── config/
│               │   └── SecurityConfig.java           ← CORS (allow :3000), BCrypt bean, permit all routes
│               │
│               ├── model/                            ← Plain Java classes with getters/setters/builders
│               │   ├── Ngo.java                      ← ngoName, location, kumbhZone, lat, lng, food, people
│               │   ├── User.java                     ← name, email, password (BCrypt), role, contact
│               │   ├── Transfer.java                 ← id, from, to, meals, distance, urgency, status, time
│               │   ├── Donation.java                 ← id, donorName, quantity, type, lat, lng, matchedNgo
│               │   ├── Alert.java                    ← from, to, meals, distance, urgency, sameZone, zone info
│               │   └── VolunteerAssignment.java      ← id, name, phone, fromNgo, toNgo, meals, status
│               │
│               ├── service/
│               │   ├── DataStore.java                ← ConcurrentHashMap/CopyOnWriteArrayList in-memory DB
│               │   ├── MatchingService.java          ← Haversine + zone-aware matching + demand prediction
│               │   └── WhatsAppService.java          ← Twilio SDK wrapper — graceful no-op if unconfigured
│               │
│               └── controller/
│                   ├── AuthController.java           ← /api/auth/signup, /api/auth/signin
│                   ├── NgoController.java            ← /api/ngos, /api/ngo/*, /api/alerts, /api/stats,
│                   │                                    /api/impact, /api/seed
│                   ├── TransferController.java       ← /api/transfer/confirm, /api/donate,
│                   │                                    /api/history/*
│                   └── VolunteerController.java      ← /api/volunteer/*
│
└── ⚛️  frontend/                          ← React 18 SPA
    ├── public/
    │   └── index.html                    ← Single HTML shell
    └── src/
        ├── 🔑 index.js                   ← ReactDOM.render entry
        ├── 🔑 App.js                     ← Root: auth state, tab nav, AppContext, role filtering
        ├── 🎨 App.css                    ← All styles — saffron Kumbh theme, responsive
        ├── 🔌 api.js                     ← Shared fetch wrapper → http://localhost:8080/api
        └── components/
            ├── Auth.js                   ← Login/Signup — role selector, Kumbh Zone dropdown, GPS
            ├── Dashboard.js              ← Stats cards, Impact Banner, camp table, bar chart
            ├── Alerts.js                 ← Zone-aware alerts, demand prediction, confirm + assign
            ├── Donate.js                 ← Donation form, GPS auto-detect, how-it-works panel
            ├── NGOMap.js                 ← Leaflet map, Prayagraj center, surplus/deficit markers
            ├── RegisterNGO.js            ← Register camp form + update food data form
            ├── History.js                ← Transfer log, donation log, impact summary
            └── Volunteer.js             ← Assign form, live dispatch board, mark delivered
```

---

## 🌐 High-Level System Overview

```
╔══════════════════════════════════════════════════════════════════════╗
║                        BROWSER (User)                               ║
║                                                                      ║
║   ┌──────────────────────────────────────────────────────────────┐  ║
║   │                  React SPA  :3000                            │  ║
║   │                                                              │  ║
║   │  ┌─────────┐ ┌────────┐ ┌────────┐ ┌──────┐ ┌──────────┐  │  ║
║   │  │  Auth   │ │ Dash-  │ │ Alerts │ │ Map  │ │Volunteer │  │  ║
║   │  │         │ │ board  │ │        │ │      │ │          │  │  ║
║   │  └─────────┘ └────────┘ └────────┘ └──────┘ └──────────┘  │  ║
║   │  ┌─────────┐ ┌────────┐ ┌────────┐                         │  ║
║   │  │ Donate  │ │History │ │Register│  api.js (fetch wrapper) │  ║
║   │  └─────────┘ └────────┘ └────────┘                         │  ║
║   └──────────────────────────┬───────────────────────────────────┘  ║
║                              │ HTTP/JSON REST                        ║
╚══════════════════════════════╪══════════════════════════════════════╝
                               │
                    ┌──────────▼──────────┐
                    │  Spring Boot  :8080  │
                    │                     │
                    │  ┌───────────────┐  │
                    │  │  Controllers  │  │
                    │  │  Auth         │  │
                    │  │  Ngo          │  │
                    │  │  Transfer     │  │
                    │  │  Volunteer    │  │
                    │  └──────┬────────┘  │
                    │         │           │
                    │  ┌──────▼────────┐  │
                    │  │   Services    │  │
                    │  │  DataStore    │  │
                    │  │  Matching     │  │
                    │  │  WhatsApp     │  │
                    │  └──────┬────────┘  │
                    │         │           │
                    │  ┌──────▼────────┐  │
                    │  │  In-Memory DB │  │
                    │  │  ConcurrentH  │  │
                    │  │  ashMap/List  │  │
                    │  └───────────────┘  │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │   Twilio API        │
                    │   WhatsApp Cloud    │
                    │                     │
                    │  → NGO contacts     │
                    │  → Volunteers       │
                    └─────────────────────┘
```

---

## 🟦 Layered Backend Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                          │
│                      (Controllers)                              │
│                                                                 │
│  AuthController   NgoController   TransferController            │
│  VolunteerController                                            │
│                                                                 │
│  • Receives HTTP requests from React                            │
│  • Validates required fields                                    │
│  • Calls service layer                                          │
│  • Returns JSON responses                                       │
└────────────────────────────┬────────────────────────────────────┘
                             │ calls
┌────────────────────────────▼────────────────────────────────────┐
│                      SERVICE LAYER                              │
│                                                                 │
│  MatchingService          WhatsAppService                       │
│  • Haversine formula      • Twilio SDK wrapper                  │
│  • Zone-aware matching    • Graceful no-op if unconfigured      │
│  • Demand prediction      • Formats +91 WhatsApp numbers        │
│  • Urgency scoring                                              │
│                                                                 │
│  DataStore (Component)                                          │
│  • ConcurrentHashMap<String, Ngo>     (thread-safe)             │
│  • ConcurrentHashMap<String, User>    (thread-safe)             │
│  • CopyOnWriteArrayList<Transfer>     (thread-safe reads)       │
│  • CopyOnWriteArrayList<Donation>     (thread-safe reads)       │
│  • CopyOnWriteArrayList<Volunteer>    (thread-safe reads)       │
└────────────────────────────┬────────────────────────────────────┘
                             │ reads/writes
┌────────────────────────────▼────────────────────────────────────┐
│                       DATA LAYER                                │
│                    (In-Memory Store)                            │
│                                                                 │
│  All data lives in JVM heap — fast, zero config for demo        │
│  Upgrade path: swap DataStore with JPA repositories             │
│  + PostgreSQL/H2 without changing any controller code           │
└─────────────────────────────────────────────────────────────────┘
```

---

## ⚛️ Frontend Component Architecture

```
index.js
└── App.js  (AppContext Provider)
    │
    │  AppContext = { user, showToast, triggerRefresh, refresh, setTab }
    │
    ├── Auth.js              (shown when user == null)
    │
    └── [Tab Navigation — filtered by user.role]
        │
        ├── Dashboard.js
        │     ├── GET /api/stats
        │     ├── GET /api/ngos
        │     └── GET /api/impact
        │           └── Kumbh Impact Banner
        │           └── Camp Table (with Zone column)
        │           └── BarChart (Food vs Pilgrim Need)
        │
        ├── Alerts.js
        │     └── GET /api/alerts
        │           └── Alert Cards (CRITICAL / HIGH / MEDIUM)
        │           └── POST /api/transfer/confirm
        │                 └── WhatsApp fires → both NGOs
        │                 └── "Assign Volunteer" → setTab("Volunteer")
        │
        ├── Donate.js
        │     └── POST /api/donate
        │           └── GPS auto-detect
        │           └── WhatsApp fires → matched NGO
        │
        ├── NGOMap.js
        │     └── GET /api/ngos
        │           └── Leaflet map (Prayagraj center)
        │           └── Green markers = surplus
        │           └── Red markers = deficit
        │
        ├── Volunteer.js
        │     ├── GET /api/history/transfers  (populate dropdown)
        │     ├── GET /api/volunteer/list     (dispatch board)
        │     ├── POST /api/volunteer/assign
        │     │     └── WhatsApp → volunteer + receiving NGO
        │     └── POST /api/volunteer/complete
        │
        ├── History.js
        │     ├── GET /api/history/transfers
        │     └── GET /api/history/donations
        │
        └── RegisterNGO.js
              ├── POST /api/ngo/register
              └── POST /api/ngo/update
```

---

## 🔁 Request-Response Lifecycle

```
User clicks "Confirm Transfer" in Alerts.js
         │
         ▼
[1] React — api.post("/transfer/confirm", alertData)
         │
         ▼
[2] HTTP POST → http://localhost:8080/api/transfer/confirm
    Headers: Content-Type: application/json
    Body:    { from, to, meals_to_transfer, distance_km, urgency }
         │
         ▼
[3] Spring Boot — SecurityConfig CORS filter
    Checks: Origin = http://localhost:3000 ✅
         │
         ▼
[4] TransferController.confirmTransfer()
    • Parses request body
    • Creates Transfer object with id + timestamp
    • Adds to DataStore.transfers
         │
         ▼
[5] Updates DataStore.ngos
    fromNgo.foodAvailable -= meals
    toNgo.foodAvailable   += meals
         │
         ▼
[6] WhatsAppService.send(fromNgo.contact, senderMsg)
    WhatsAppService.send(toNgo.contact,   receiverMsg)
    → Twilio API call (or silent skip if not configured)
         │
         ▼
[7] Returns JSON:
    { message, transfer: {...}, whatsapp: { twilio_enabled } }
         │
         ▼
[8] React — res.transfer exists
    • setConfirmed({ [idx]: true })
    • showToast("✅ 200 meals: Sangam → Triveni")
    • triggerRefresh()  → Dashboard re-fetches /stats
    • "Assign Volunteer" button appears
```

---

## 🧠 Smart Matching Engine Architecture

```
GET /api/alerts
       │
       ▼
NgoController.getAlerts()
       │
       ▼
MatchingService.computeAlerts(DataStore.ngos.values())
       │
       ├── predictDemand()
       │     LocalTime.now().getHour()
       │     Returns: (multiplier, demandReason)
       │     ┌─────────────────────────────────────┐
       │     │ 04-07h → 1.8x  Snan rush            │
       │     │ 07-10h → 1.5x  Morning meal peak     │
       │     │ 11-14h → 1.3x  Midday rush           │
       │     │ 17-20h → 1.6x  Aarti time            │
       │     │ 20-23h → 1.2x  Night distribution    │
       │     │ else   → 0.9x  Low activity          │
       │     └─────────────────────────────────────┘
       │
       ├── Split NGOs
       │     surplus = food > people
       │     deficit = food < people
       │
       ├── For each deficit NGO:
       │     effectiveNeed = (people - food) × multiplier
       │     │
       │     ├── PASS 1: Same-zone scan
       │     │     for s in surplus:
       │     │       if s.kumbhZone == d.kumbhZone:
       │     │         dist = haversine(d, s)
       │     │         if dist < bestDist → best = s, sameZone = true
       │     │
       │     ├── PASS 2: Cross-zone fallback (if no same-zone found)
       │     │     for s in surplus:
       │     │       dist = haversine(d, s)
       │     │       if dist < bestDist → best = s, sameZone = false
       │     │
       │     ├── transfer = min(surplus can give, effectiveNeed)
       │     │
       │     └── urgency:
       │           rawDeficit > 300 → CRITICAL (pulsing red badge)
       │           rawDeficit > 100 → HIGH
       │           else             → MEDIUM
       │
       └── Sort alerts by distanceKm ASC
             Return List<Alert>
```

---

## 📲 WhatsApp Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   WhatsAppService                           │
│                                                             │
│  @PostConstruct init()                                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ accountSid.startsWith("AC")                         │   │
│  │ AND authToken != "your_auth_token_here"             │   │
│  │         │                                           │   │
│  │    YES  ▼                    NO                     │   │
│  │  Twilio.init()          enabled = false             │   │
│  │  enabled = true         (silent demo mode)          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  send(toNumber, body)                                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ if !enabled → return false (no crash)               │   │
│  │ clean number → "whatsapp:+91XXXXXXXXXX"             │   │
│  │ Twilio Message.creator(to, from, body).create()     │   │
│  │ catch Exception → log + return false (no crash)     │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
  Twilio Cloud API
         │
         ▼
  WhatsApp → Recipient's phone

Trigger points:
  1. POST /api/donate            → matched NGO
  2. POST /api/transfer/confirm  → sender NGO + receiver NGO
  3. POST /api/volunteer/assign  → volunteer + receiver NGO
```

---

## 🗺️ Full System Data Flow

```
 DONOR                    NGO                     VOLUNTEER
   │                       │                          │
   │ Submit food            │                          │
   ▼                       │                          │
POST /donate               │                          │
   │                       │                          │
   ├─ Match nearest NGO     │                          │
   │                       │                          │
   └─ WhatsApp ────────────►│ "New donation matched"   │
                            │                          │
                            │ Update food data         │
                            ▼                          │
                       POST /ngo/update                │
                            │                          │
                            │ Check alerts             │
                            ▼                          │
                       GET /alerts                     │
                            │                          │
                       MatchingService                 │
                       zone-aware match                │
                            │                          │
                            │ Confirm transfer          │
                            ▼                          │
                       POST /transfer/confirm          │
                            │                          │
                            ├─ Update food counts      │
                            │                          │
                            ├─ WhatsApp to sender ─────────────────┐
                            │                          │            │
                            └─ WhatsApp to receiver ──►│            │
                                                        │            │
                            Assign volunteer            │            │
                            ▼                          │            │
                       POST /volunteer/assign          │            │
                            │                          │            │
                            ├─ WhatsApp ───────────────────────────►│
                            │   "Pickup: X, Deliver: Y"│            │
                            │                          │            │
                            └─ WhatsApp ──────────────►│            │
                                "Volunteer on the way" │            │
                                                        │            │
                                                        │  Delivers  │
                                                        │◄───────────┘
                                                        │
                                                   POST /volunteer/complete
                                                        │
                                                   status = "delivered"
                                                   Impact metrics update
```

---

## 🔐 Security Design

| Concern | Implementation |
|---------|---------------|
| Password storage | BCrypt with salt rounds (Spring Security default: 10) |
| CORS | Restricted to `http://localhost:3000` only |
| CSRF | Disabled — stateless REST API, no session cookies |
| Auth tokens | localStorage (demo) — upgrade to JWT for production |
| Input validation | Required field checks in all controllers |
| Twilio credentials | In `application.properties` — never in source code |

---

## ⚙️ Environment Configuration

### Backend — `application.properties`
```properties
server.port=8080

# Twilio — fill these to enable WhatsApp
twilio.account-sid=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
twilio.auth-token=your_auth_token_here
twilio.whatsapp-from=whatsapp:+14155238886
```

### Frontend — `api.js`
```javascript
const BASE = "http://localhost:8080/api";
```
Change `localhost` to your server IP for network/deployment access.

### Kumbh Zones (predefined)
```
Zone A - Sangam      (Sangam Ghat, Triveni Ghat)
Zone B - Ganga       (Ganga Ghat, Yamuna Bank)
Zone C - Tent City   (Sector 12, Sector 18)
Zone D - Yamuna      (Yamuna side camps)
Zone E - Outer Camp  (Peripheral sectors)
```

---

<div align="center">
  <strong>🪔 KumbhAnna — Kumbhathon 2025</strong><br/>
  Built with Java + React for the world's largest human gathering
</div>
