from flask import Flask, request, jsonify
from flask_cors import CORS
from redistribution import compute_alerts
from datetime import datetime

app = Flask(__name__)
CORS(app)

# In-memory store (replace with Firebase/MongoDB in production)
ngos = {}
donations = []
transfers = []

@app.route("/api/ngo/register", methods=["POST"])
def register_ngo():
    data = request.json
    required = ["ngo_name", "location", "latitude", "longitude", "contact"]
    if not all(k in data for k in required):
        return jsonify({"error": "Missing fields"}), 400
    ngos[data["ngo_name"]] = {**data, "food_available": 0, "people_count": 0}
    return jsonify({"message": "NGO registered", "ngo": ngos[data["ngo_name"]]})

@app.route("/api/ngo/update", methods=["POST"])
def update_ngo():
    data = request.json
    name = data.get("ngo_name")
    if name not in ngos:
        return jsonify({"error": "NGO not found"}), 404
    ngos[name]["food_available"] = data.get("food_available", ngos[name]["food_available"])
    ngos[name]["people_count"] = data.get("people_count", ngos[name]["people_count"])
    ngos[name]["timestamp"] = datetime.now().isoformat()
    return jsonify({"message": "Updated", "ngo": ngos[name]})

@app.route("/api/ngos", methods=["GET"])
def get_ngos():
    return jsonify(list(ngos.values()))

@app.route("/api/alerts", methods=["GET"])
def get_alerts():
    if len(ngos) < 2:
        return jsonify([])
    alerts = compute_alerts(list(ngos.values()))
    return jsonify(alerts)

@app.route("/api/donate", methods=["POST"])
def donate():
    data = request.json
    required = ["donor_name", "food_quantity", "food_type", "latitude", "longitude", "expiry_hours"]
    if not all(k in data for k in required):
        return jsonify({"error": "Missing fields"}), 400
    donation = {**data, "id": len(donations) + 1, "status": "pending", "timestamp": datetime.now().isoformat()}
    donations.append(donation)
    # Auto-match nearest NGO with deficit
    deficit_ngos = [n for n in ngos.values() if n["food_available"] < n["people_count"]]
    if deficit_ngos:
        from redistribution import haversine
        nearest = min(deficit_ngos, key=lambda n: haversine(
            data["latitude"], data["longitude"], n["latitude"], n["longitude"]
        ))
        donation["matched_ngo"] = nearest["ngo_name"]
        donation["status"] = "matched"
    return jsonify(donation)

@app.route("/api/transfer/confirm", methods=["POST"])
def confirm_transfer():
    data = request.json
    transfer = {**data, "id": len(transfers) + 1, "status": "completed", "timestamp": datetime.now().isoformat()}
    transfers.append(transfer)
    # Update food counts
    frm = data.get("from")
    to = data.get("to")
    meals = data.get("meals_to_transfer", 0)
    if frm in ngos:
        ngos[frm]["food_available"] = max(0, ngos[frm]["food_available"] - meals)
    if to in ngos:
        ngos[to]["food_available"] = ngos[to].get("food_available", 0) + meals
    return jsonify({"message": "Transfer confirmed", "transfer": transfer})

@app.route("/api/stats", methods=["GET"])
def stats():
    total_food = sum(n["food_available"] for n in ngos.values())
    total_need = sum(n["people_count"] for n in ngos.values())
    meals_saved = sum(t.get("meals_to_transfer", 0) for t in transfers)
    return jsonify({
        "total_ngos": len(ngos),
        "total_food_available": total_food,
        "total_people_to_feed": total_need,
        "meals_redistributed": meals_saved,
        "active_donations": len([d for d in donations if d["status"] == "pending"]),
        "completed_transfers": len(transfers)
    })

@app.route("/api/seed", methods=["POST"])
def seed_demo_data():
    demo_ngos = [
        {"ngo_name": "Helping Hands", "location": "Pune", "latitude": 18.5204, "longitude": 73.8567, "contact": "9800000001", "food_available": 500, "people_count": 200},
        {"ngo_name": "Food For All", "location": "Pune", "latitude": 18.5314, "longitude": 73.8446, "contact": "9800000002", "food_available": 50, "people_count": 350},
        {"ngo_name": "Annapurna NGO", "location": "Pune", "latitude": 18.5089, "longitude": 73.8259, "contact": "9800000003", "food_available": 80, "people_count": 400},
        {"ngo_name": "Seva Trust", "location": "Pune", "latitude": 18.5642, "longitude": 73.7769, "contact": "9800000004", "food_available": 600, "people_count": 150},
    ]
    for n in demo_ngos:
        ngos[n["ngo_name"]] = {**n, "timestamp": datetime.now().isoformat()}
    return jsonify({"message": "Demo data loaded", "count": len(demo_ngos)})

if __name__ == "__main__":
    app.run(debug=True, port=5000)
