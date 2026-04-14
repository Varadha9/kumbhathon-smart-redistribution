# 🍛 Smart Redistribution App
### AI-Powered Food Redistribution Platform | Kumbhathon Project

> Connecting NGOs in real-time to eliminate food waste and fight hunger using AI-based smart matching and geolocation.

---

## 📌 Table of Contents

- [Problem Statement](#-problem-statement)
- [Solution Overview](#-solution-overview)
- [Live Demo Flow](#-live-demo-flow)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Architecture](#-architecture)
- [AI Logic Explained](#-ai-logic-explained)
- [API Reference](#-api-reference)
- [Getting Started](#-getting-started)
- [Screenshots](#-screenshots)
- [Socio-Economic Impact](#-socio-economic-impact)
- [Challenges & Limitations](#-challenges--limitations)
- [Future Enhancements](#-future-enhancements)
- [Team](#-team)

---

## 🚨 Problem Statement

Every day in India:
- **40% of food produced** goes to waste
- **19 crore people** go to bed hungry
- NGOs work **in isolation** — one has surplus, another struggles

**The gap:** No real-time system connects food surplus to food deficit across NGOs.

> Imagine a wedding with 60 leftover plates of food, while 2 km away an NGO can't feed 100 people. This app bridges that gap — instantly.

---

## 💡 Solution Overview

The Smart Redistribution App is a full-stack web platform where:

1. **NGOs** register and update their food availability + people count
2. **Donors** (restaurants, events, canteens) submit surplus food with GPS location
3. **AI Engine** detects surplus/deficit, calculates distances, and generates transfer alerts
4. **NGOs** confirm transfers — food moves from surplus to deficit in minutes

---

## 📱 Live Demo Flow

```
Step 1: Open app → Click "Load Demo Data" on Dashboard
Step 2: See 4 NGOs with surplus/deficit status in the table + bar chart
Step 3: Go to Alerts tab → AI shows transfer suggestions with distance + urgency
Step 4: Click "Confirm Transfer" → food counts update automatically
Step 5: Go to Map tab → See green (surplus) and red (deficit) NGO pins on live map
Step 6: Go to Donate tab → Submit food as a donor with GPS auto-detect
Step 7: Go to Register NGO → Add a new NGO or update food data
```

---

## ✨ Features

| Tab | Feature | Description |
|-----|---------|-------------|
| 📊 Dashboard | Live Stats | Total NGOs, food available, people to feed, meals redistributed |
| 📊 Dashboard | NGO Table | All NGOs with surplus/deficit status |
| 📊 Dashboard | Bar Chart | Visual comparison of food vs need per NGO |
| 🔔 Alerts | AI Suggestions | Auto-generated transfer recommendations |
| 🔔 Alerts | Urgency Levels | HIGH / MEDIUM based on deficit size |
| 🔔 Alerts | Confirm Transfer | One-click to confirm and update food counts |
| 🍛 Donate | Food Submission | Donors submit food quantity, type, expiry time |
| 🍛 Donate | GPS Auto-detect | Auto-fills latitude/longitude using browser location |
| 🍛 Donate | Auto-matching | Instantly matches donation to nearest deficit NGO |
| 🗺️ Map | Live Map | OpenStreetMap with NGO markers |
| 🗺️ Map | Color Coding | Green = surplus, Red = deficit |
| 🗺️ Map | Radius Circles | Visual coverage area per NGO |
| 🗺️ Map | Popups | Click marker to see food/people data |
| 🏢 Register NGO | Add NGO | Register new NGOs with location coordinates |
| 🏢 Register NGO | Update Data | Update food available + people count anytime |

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| Python 3 | Core language |
| Flask | REST API framework |
| Flask-CORS | Cross-origin requests |
| Haversine Formula | Distance calculation between GPS coordinates |

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 18 | UI framework |
| Recharts | Bar charts and data visualization |
| Leaflet + React-Leaflet | Interactive map with NGO markers |
| OpenStreetMap | Free map tiles (no API key needed) |
| CSS3 | Custom styling, responsive layout |

### Infrastructure
| Technology | Purpose |
|-----------|---------|
| In-memory store | Fast prototyping (dict/list in Python) |
| REST API | JSON communication between frontend and backend |

---

## 📁 Project Structure

```
kumbhathon-smart-redistribution/
│
├── backend/
│   ├── app.py                  # Flask API — all 7 endpoints
│   ├── redistribution.py       # AI matching engine + Haversine formula
│   ├── requirements.txt        # Python dependencies
│   └── test_logic.py           # Test script for AI logic
│
├── frontend/
│   ├── public/
│   │   └── index.html          # HTML entry point
│   └── src/
│       ├── components/
│       │   ├── Dashboard.js    # Stats cards + NGO table + bar chart
│       │   ├── Alerts.js       # AI redistribution alerts + confirm
│       │   ├── Donate.js       # Food donation form with GPS
│       │   ├── NGOMap.js       # Leaflet map with surplus/deficit markers
│       │   └── RegisterNGO.js  # Register NGO + update food data forms
│       ├── api.js              # Shared fetch utility (GET/POST)
│       ├── App.js              # Main app with tab navigation
│       ├── App.css             # Global styles
│       └── index.js            # React entry point
│
├── start.bat                   # One-click Windows launcher
└── README.md                   # This file
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│           React Frontend                │
│         (localhost:3000)                │
│                                         │
│  Dashboard | Alerts | Donate | Map | Register │
└──────────────────┬──────────────────────┘
                   │ REST API (JSON)
                   ▼
┌─────────────────────────────────────────┐
│           Flask Backend                 │
│         (localhost:5000)                │
│                                         │
│  /api/ngos  /api/alerts  /api/donate    │
│  /api/ngo/register  /api/ngo/update     │
│  /api/transfer/confirm  /api/stats      │
└──────────────────┬──────────────────────┘
                   │
         ┌─────────┴──────────┐
         ▼                    ▼
┌─────────────────┐  ┌────────────────────┐
│  In-Memory Store│  │  Redistribution    │
│  (ngos, donors, │  │  Engine            │
│   transfers)    │  │                    │
│                 │  │  - Surplus/Deficit │
│  → upgrade to   │  │  - Haversine Dist  │
│  Firebase /     │  │  - Best NGO Match  │
│  MongoDB        │  │  - Urgency Score   │
└─────────────────┘  └────────────────────┘
```

---

## 🧠 AI Logic Explained

The core intelligence lives in `backend/redistribution.py`.

### Step 1 — Classify NGOs
```python
surplus = [n for n in ngos if n["food_available"] > n["people_count"]]
deficit = [n for n in ngos if n["food_available"] < n["people_count"]]
```

### Step 2 — Calculate Distance (Haversine Formula)
The Haversine formula calculates the great-circle distance between two GPS coordinates on Earth's surface.

```python
def haversine(lat1, lon1, lat2, lon2):
    R = 6371  # Earth's radius in km
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)**2
    return R * 2 * atan2(sqrt(a), sqrt(1 - a))
```

### Step 3 — Match Nearest Surplus to Each Deficit NGO
```python
best_match = min(surplus_ngos, key=lambda n: haversine(
    deficit.latitude, deficit.longitude,
    n.latitude, n.longitude
))
```

### Step 4 — Calculate Transfer Amount
```python
transfer = min(
    surplus_ngo["food_available"] - surplus_ngo["people_count"],  # max it can give
    deficit_ngo["people_count"] - deficit_ngo["food_available"]   # max it needs
)
```

### Step 5 — Assign Urgency
```python
urgency = "HIGH" if deficit > 100 meals else "MEDIUM"
```

### Example Output
```json
{
  "from": "Helping Hands",
  "to": "Food For All",
  "meals_to_transfer": 300,
  "distance_km": 1.77,
  "urgency": "HIGH"
}
```

---

## 📡 API Reference

### Base URL: `http://localhost:5000/api`

| Method | Endpoint | Description | Body |
|--------|---------|-------------|------|
| `GET` | `/ngos` | Get all registered NGOs | — |
| `GET` | `/alerts` | Get AI redistribution alerts | — |
| `GET` | `/stats` | Get platform statistics | — |
| `POST` | `/ngo/register` | Register a new NGO | `ngo_name, location, latitude, longitude, contact` |
| `POST` | `/ngo/update` | Update NGO food data | `ngo_name, food_available, people_count` |
| `POST` | `/donate` | Submit a food donation | `donor_name, food_quantity, food_type, latitude, longitude, expiry_hours` |
| `POST` | `/transfer/confirm` | Confirm a transfer alert | `from, to, meals_to_transfer` |
| `POST` | `/seed` | Load demo data | — |

### Sample Request — Register NGO
```bash
curl -X POST http://localhost:5000/api/ngo/register \
  -H "Content-Type: application/json" \
  -d '{
    "ngo_name": "Helping Hands",
    "location": "Pune",
    "latitude": 18.5204,
    "longitude": 73.8567,
    "contact": "9800000001"
  }'
```

### Sample Response — Get Alerts
```json
[
  {
    "from": "Helping Hands",
    "to": "Food For All",
    "meals_to_transfer": 300,
    "distance_km": 1.77,
    "urgency": "HIGH"
  },
  {
    "from": "Seva Trust",
    "to": "Annapurna NGO",
    "meals_to_transfer": 320,
    "distance_km": 9.84,
    "urgency": "HIGH"
  }
]
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm

### Option 1: One-Click (Windows)
```
Double-click start.bat
```
This opens two terminal windows — one for backend, one for frontend.

### Option 2: Manual Setup

**Backend**
```bash
cd backend
pip install -r requirements.txt
python app.py
```
Backend runs at → `http://localhost:5000`

**Frontend**
```bash
cd frontend
npm install
npm start
```
Frontend runs at → `http://localhost:3000`

### Option 3: Test AI Logic Only
```bash
cd backend
python test_logic.py
```
Expected output:
```
=== Redistribution Alerts ===
  Move 300 meals: NGO A -> NGO B | 1.77 km | HIGH
  Move 300 meals: NGO A -> NGO C | 3.49 km | HIGH
Distance A->B: 1.77 km
```

---

## 🌱 Socio-Economic Impact

### Social Impact
- **Hunger Reduction** — Surplus food reaches needy people within minutes, not hours
- **NGO Collaboration** — Creates a connected network instead of isolated organizations
- **Faster Response** — Critical during natural disasters and large public events
- **Data Visibility** — NGOs can see nearby organizations and food availability trends

### Economic Impact
- **Reduces Food Waste Costs** — Less food disposed = less money wasted by donors and NGOs
- **Optimized Transport** — Nearest-NGO matching reduces fuel cost and delivery time
- **Better Fund Utilization** — NGOs avoid over-purchasing; saved funds go to education, healthcare, shelter
- **Scalability** — Can expand from city → state → country level with government/CSR integration

### Environmental Impact
- **Less Food in Landfills** — Reduces methane emissions from decomposing food
- **Shorter Transport Routes** — Lower carbon footprint through efficient logistics
- **Supports UN SDG Goals** — Directly addresses SDG 2 (Zero Hunger) and SDG 12 (Responsible Consumption)

### Technological Impact
- Promotes AI adoption in social good
- Encourages smart city solutions
- Real-time data usage improves urban food planning

---

## ⚠️ Challenges & Limitations

| Challenge | Description | Future Fix |
|-----------|-------------|------------|
| Data Accuracy | System depends on NGOs updating data regularly | IoT sensors for auto-updates |
| Internet Dependency | Remote areas may lack connectivity | Offline-first mobile app |
| Trust Between NGOs | Organizations may hesitate to share data | Verified NGO onboarding + ratings |
| Logistics Coordination | Vehicles and timing need manual coordination | Volunteer/driver assignment module |
| Food Quality Verification | No way to verify food is safe to eat | Photo upload + quality checklist |
| In-Memory Storage | Data resets when server restarts | Firebase / MongoDB integration |

---

## 🔮 Future Enhancements

- [ ] **Firebase Real-time Database** — Persistent data, live sync across devices
- [ ] **Push Notifications** — Instant alerts to NGO mobile apps
- [ ] **IoT Sensor Integration** — Auto-detect food quantity via smart containers
- [ ] **Government Food Program API** — Connect with PDS and mid-day meal schemes
- [ ] **Mobile App (Flutter)** — Cross-platform Android/iOS app
- [ ] **Volunteer Management** — Assign and track delivery volunteers
- [ ] **Food Quality Checklist** — Photo upload + expiry verification before transfer
- [ ] **Analytics Dashboard** — Monthly reports, area-wise hunger maps
- [ ] **Multi-language Support** — Hindi, Marathi, Tamil for wider NGO adoption
- [ ] **WhatsApp Bot Integration** — NGOs update food data via WhatsApp message

---

## 🙏 Acknowledgements

- **Kumbhathon** — For the platform and opportunity to build for social good
- **OpenStreetMap** — Free map tiles used in the live map feature
- **Leaflet.js** — Open-source interactive map library
- **Recharts** — React chart library for data visualization
- Inspired by real platforms: **Feeding India**, **No Food Waste**, **Too Good To Go**

---

<div align="center">
  <strong>Built with ❤️ for Kumbhathon</strong><br/>
  Fighting hunger, one meal at a time 🍛
</div>
