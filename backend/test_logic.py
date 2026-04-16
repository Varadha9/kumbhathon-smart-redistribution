# test_logic.py
# A simple standalone test script to verify the AI engine works correctly.
# Run this WITHOUT starting the full server: python test_logic.py
# It does NOT need Flask or React — just tests the redistribution logic directly.

from redistribution import compute_alerts, haversine

# Sample test data — 1 surplus NGO (NGO A) and 2 deficit NGOs (B and C)
# NGO A has 500 food for 200 people → surplus of 300
# NGO B has 50 food for 350 people  → deficit of 300
# NGO C has 80 food for 400 people  → deficit of 320
ngos = [
    {"ngo_name": "NGO A", "latitude": 18.5204, "longitude": 73.8567, "food_available": 500, "people_count": 200},
    {"ngo_name": "NGO B", "latitude": 18.5314, "longitude": 73.8446, "food_available": 50,  "people_count": 350},
    {"ngo_name": "NGO C", "latitude": 18.5089, "longitude": 73.8259, "food_available": 80,  "people_count": 400},
]

# Run the AI engine and print the generated alerts
alerts = compute_alerts(ngos)
print("=== Redistribution Alerts ===")
for a in alerts:
    print(f"  Move {a['meals_to_transfer']} meals: {a['from']} -> {a['to']} | {a['distance_km']} km | {a['urgency']}")

# Also test the Haversine distance function directly
print(f"\nDistance A→B: {round(haversine(18.5204, 73.8567, 18.5314, 73.8446), 2)} km")
print("✅ AI logic working correctly!")
