# 🍛 Smart Redistribution App — Kumbhathon Project

An AI-powered food redistribution platform connecting NGOs to eliminate food waste and hunger.

## 🚀 Quick Start

### Option 1: One-click (Windows)
```
Double-click start.bat
```

### Option 2: Manual

**Backend (Terminal 1)**
```bash
cd backend
pip install -r requirements.txt
python app.py
```

**Frontend (Terminal 2)**
```bash
cd frontend
npm install
npm start
```

Open **http://localhost:3000**

---

## 📱 App Features

| Tab | Description |
|-----|-------------|
| Dashboard | Stats, NGO table, Food vs Need chart |
| Alerts | AI-generated redistribution suggestions |
| Donate | Donors submit food with GPS auto-detect |
| Map | Live map of NGOs (green=surplus, red=deficit) |
| Register NGO | Add new NGOs, update food data |

---

## 🧠 How the AI Logic Works

1. Each NGO reports `food_available` and `people_count`
2. System detects **surplus** (`food > people`) and **deficit** (`food < people`)
3. Haversine formula calculates distance between NGOs
4. Nearest surplus NGO is matched to each deficit NGO
5. Transfer alert is generated with meals count + distance

```python
# Core matching logic
surplus = food_available - people_count  # if positive
deficit = people_count - food_available  # if negative

# Nearest match using Haversine distance
best_match = min(surplus_ngos, key=lambda n: haversine(deficit.lat, deficit.lon, n.lat, n.lon))
```

---

## 🏗️ Architecture

```
React Frontend (port 3000)
        ↓ REST API
Flask Backend (port 5000)
        ↓
In-memory Store → (upgrade to Firebase/MongoDB)
        ↓
Redistribution Engine (AI matching + Haversine)
```

---

## 🌱 Socio-Economic Impact

- **Hunger Reduction**: Surplus food reaches needy people instantly
- **Cost Savings**: Reduces food disposal + transport costs
- **NGO Collaboration**: Creates a connected network
- **Environmental**: Less food waste = lower methane emissions

---

## 🔮 Future Enhancements

- Firebase real-time database
- Push notifications
- IoT sensor integration
- Government food program API
- Mobile app (Flutter)
