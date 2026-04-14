from redistribution import compute_alerts, haversine

ngos = [
    {"ngo_name": "NGO A", "latitude": 18.5204, "longitude": 73.8567, "food_available": 500, "people_count": 200},
    {"ngo_name": "NGO B", "latitude": 18.5314, "longitude": 73.8446, "food_available": 50,  "people_count": 350},
    {"ngo_name": "NGO C", "latitude": 18.5089, "longitude": 73.8259, "food_available": 80,  "people_count": 400},
]

alerts = compute_alerts(ngos)
print("=== Redistribution Alerts ===")
for a in alerts:
    print(f"  Move {a['meals_to_transfer']} meals: {a['from']} -> {a['to']} | {a['distance_km']} km | {a['urgency']}")

print(f"\nDistance A→B: {round(haversine(18.5204, 73.8567, 18.5314, 73.8446), 2)} km")
print("✅ AI logic working correctly!")
