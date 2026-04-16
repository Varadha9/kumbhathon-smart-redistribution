# app.py
# This is the Flask BACKEND — the server that handles all API requests.
# The React frontend talks to this file via HTTP (REST API).
# Every @app.route defines one API endpoint (URL the frontend can call).

from flask import Flask, request, jsonify
from flask_cors import CORS
from redistribution import compute_alerts  # import our AI matching engine
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Allow React (localhost:3000) to call this Flask server (localhost:5001)

# ── In-Memory Data Store ──────────────────────────────────────────────────────
# These are Python dicts/lists that act as our "database".
# Data is lost when the server restarts — upgrade to Firebase/MongoDB for production.
ngos = {}        # key = ngo_name, value = NGO data dict
donations = []   # list of all food donations submitted
transfers = []   # list of all confirmed transfers
users = {}       # key = email, value = user dict (for auth)

# ── Auth Routes ───────────────────────────────────────────────────────────────

@app.route("/api/auth/signup", methods=["POST"])
def signup():
    """
    Creates a new user account (donor or NGO).
    If role is 'ngo', also auto-registers the NGO in the ngos store.
    """
    data = request.json
    required = ["name", "email", "password", "role"]
    if not all(k in data for k in required):
        return jsonify({"error": "Missing fields"}), 400
    if data["email"] in users:
        return jsonify({"error": "Email already registered"}), 409

    user = {
        "name":     data["name"],
        "email":    data["email"],
        "password": data["password"],  # NOTE: hash passwords in production!
        "role":     data["role"],      # "ngo" or "donor"
        "contact":  data.get("contact", ""),
    }

    # If signing up as NGO, also add them to the NGO network
    if data["role"] == "ngo":
        ngo_required = ["location", "latitude", "longitude"]
        if not all(k in data for k in ngo_required):
            return jsonify({"error": "NGO requires location, latitude, longitude"}), 400
        ngos[data["name"]] = {
            "ngo_name":       data["name"],
            "location":       data["location"],
            "latitude":       float(data["latitude"]),
            "longitude":      float(data["longitude"]),
            "contact":        data.get("contact", ""),
            "food_available": 0,   # starts at 0, NGO updates this later
            "people_count":   0,   # starts at 0, NGO updates this later
            "timestamp":      datetime.now().isoformat(),
        }

    users[data["email"]] = user
    # Return user data but never return the password
    return jsonify({"message": "Signup successful", "user": {k: v for k, v in user.items() if k != "password"}}), 201


@app.route("/api/auth/signin", methods=["POST"])
def signin():
    """
    Logs in an existing user by checking email + password.
    Returns user data (without password) on success.
    """
    data = request.json
    email    = data.get("email", "")
    password = data.get("password", "")
    user = users.get(email)
    if not user or user["password"] != password:
        return jsonify({"error": "Invalid email or password"}), 401
    return jsonify({"message": "Login successful", "user": {k: v for k, v in user.items() if k != "password"}})


# ── NGO Routes ────────────────────────────────────────────────────────────────

@app.route("/api/ngo/register", methods=["POST"])
def register_ngo():
    """
    Registers a new NGO in the system.
    Requires: ngo_name, location, latitude, longitude, contact.
    Food and people count start at 0 — NGO updates them separately.
    """
    data = request.json
    required = ["ngo_name", "location", "latitude", "longitude", "contact"]
    if not all(k in data for k in required):
        return jsonify({"error": "Missing fields"}), 400
    ngos[data["ngo_name"]] = {**data, "food_available": 0, "people_count": 0}
    return jsonify({"message": "NGO registered", "ngo": ngos[data["ngo_name"]]})


@app.route("/api/ngo/update", methods=["POST"])
def update_ngo():
    """
    Updates an NGO's current food stock and people count.
    This is what triggers the AI to recalculate alerts —
    when food_available changes, surplus/deficit status changes.
    """
    data = request.json
    name = data.get("ngo_name")
    if name not in ngos:
        return jsonify({"error": "NGO not found"}), 404
    # Only update the fields that were provided
    ngos[name]["food_available"] = data.get("food_available", ngos[name]["food_available"])
    ngos[name]["people_count"]   = data.get("people_count",   ngos[name]["people_count"])
    ngos[name]["timestamp"]      = datetime.now().isoformat()  # track when last updated
    return jsonify({"message": "Updated", "ngo": ngos[name]})


@app.route("/api/ngos", methods=["GET"])
def get_ngos():
    """
    Returns all registered NGOs as a list.
    Used by Dashboard (table), Map (markers), and RegisterNGO (dropdown).
    """
    return jsonify(list(ngos.values()))


# ── AI Alerts Route ───────────────────────────────────────────────────────────

@app.route("/api/alerts", methods=["GET"])
def get_alerts():
    """
    Calls the AI engine (compute_alerts) to generate transfer suggestions.
    Returns a list of {from, to, meals_to_transfer, distance_km, urgency}.
    Needs at least 2 NGOs to generate meaningful alerts.
    """
    if len(ngos) < 2:
        return jsonify([])  # not enough NGOs to match
    alerts = compute_alerts(list(ngos.values()))
    return jsonify(alerts)


# ── Donation Route ────────────────────────────────────────────────────────────

@app.route("/api/donate", methods=["POST"])
def donate():
    """
    Accepts a food donation from a donor (restaurant, event, canteen, etc.).
    After saving the donation, it auto-matches it to the nearest deficit NGO
    using the Haversine formula — same distance logic as the AI engine.
    """
    data = request.json
    required = ["donor_name", "food_quantity", "food_type", "latitude", "longitude", "expiry_hours"]
    if not all(k in data for k in required):
        return jsonify({"error": "Missing fields"}), 400

    # Save the donation with a unique ID and timestamp
    donation = {**data, "id": len(donations) + 1, "status": "pending", "timestamp": datetime.now().isoformat()}
    donations.append(donation)

    # Auto-match: find NGOs that need food (deficit) and pick the nearest one
    deficit_ngos = [n for n in ngos.values() if n["food_available"] < n["people_count"]]
    if deficit_ngos:
        from redistribution import haversine
        # Find the deficit NGO closest to the donor's GPS location
        nearest = min(deficit_ngos, key=lambda n: haversine(
            data["latitude"], data["longitude"], n["latitude"], n["longitude"]
        ))
        donation["matched_ngo"] = nearest["ngo_name"]
        donation["status"] = "matched"

    return jsonify(donation)


# ── Transfer Confirmation Route ───────────────────────────────────────────────

@app.route("/api/transfer/confirm", methods=["POST"])
def confirm_transfer():
    """
    Called when an NGO clicks "Confirm Transfer" on the Alerts tab.
    Records the transfer and updates both NGOs' food counts:
      - Surplus NGO loses the transferred meals
      - Deficit NGO gains the transferred meals
    """
    data = request.json
    transfer = {**data, "id": len(transfers) + 1, "status": "completed", "timestamp": datetime.now().isoformat()}
    transfers.append(transfer)

    # Update food counts for both NGOs involved
    frm   = data.get("from")
    to    = data.get("to")
    meals = data.get("meals_to_transfer", 0)

    if frm in ngos:
        # Surplus NGO gives away meals — subtract from their stock
        ngos[frm]["food_available"] = max(0, ngos[frm]["food_available"] - meals)
    if to in ngos:
        # Deficit NGO receives meals — add to their stock
        ngos[to]["food_available"] = ngos[to].get("food_available", 0) + meals

    return jsonify({"message": "Transfer confirmed", "transfer": transfer})


# ── Stats Route ───────────────────────────────────────────────────────────────

@app.route("/api/stats", methods=["GET"])
def stats():
    """
    Returns platform-wide summary numbers shown on the Dashboard stat cards:
    total NGOs, total food, total people, meals redistributed, etc.
    """
    total_food = sum(n["food_available"] for n in ngos.values())
    total_need = sum(n["people_count"]   for n in ngos.values())
    meals_saved = sum(t.get("meals_to_transfer", 0) for t in transfers)
    return jsonify({
        "total_ngos":            len(ngos),
        "total_food_available":  total_food,
        "total_people_to_feed":  total_need,
        "meals_redistributed":   meals_saved,
        "active_donations":      len([d for d in donations if d["status"] == "pending"]),
        "completed_transfers":   len(transfers)
    })


# ── History Routes ────────────────────────────────────────────────────────────

@app.route("/api/history/transfers", methods=["GET"])
def get_transfers():
    """Returns all confirmed transfers — shown in the History tab."""
    return jsonify(transfers)


@app.route("/api/history/donations", methods=["GET"])
def get_donations():
    """Returns all submitted donations — shown in the History tab."""
    return jsonify(donations)


# ── Demo Data Route ───────────────────────────────────────────────────────────

@app.route("/api/seed", methods=["POST"])
def seed_demo_data():
    """
    Loads 4 sample NGOs with realistic Pune coordinates and food data.
    2 NGOs have surplus food, 2 have deficit — so the AI can generate alerts.
    Used for demo/testing purposes via the Dashboard "Load Demo Data" button.
    """
    demo_ngos = [
        {"ngo_name": "Helping Hands", "location": "Pune", "latitude": 18.5204, "longitude": 73.8567, "contact": "9800000001", "food_available": 500, "people_count": 200},
        {"ngo_name": "Food For All",  "location": "Pune", "latitude": 18.5314, "longitude": 73.8446, "contact": "9800000002", "food_available": 50,  "people_count": 350},
        {"ngo_name": "Annapurna NGO", "location": "Pune", "latitude": 18.5089, "longitude": 73.8259, "contact": "9800000003", "food_available": 80,  "people_count": 400},
        {"ngo_name": "Seva Trust",    "location": "Pune", "latitude": 18.5642, "longitude": 73.7769, "contact": "9800000004", "food_available": 600, "people_count": 150},
    ]
    for n in demo_ngos:
        ngos[n["ngo_name"]] = {**n, "timestamp": datetime.now().isoformat()}
    return jsonify({"message": "Demo data loaded", "count": len(demo_ngos)})


if __name__ == "__main__":
    app.run(debug=True, port=5001)  # Run on port 5001 (frontend expects this port)
