from math import radians, sin, cos, sqrt, atan2

def haversine(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)**2
    return R * 2 * atan2(sqrt(a), sqrt(1 - a))

def compute_alerts(ngos):
    surplus = [n for n in ngos if n["food_available"] > n["people_count"]]
    deficit = [n for n in ngos if n["food_available"] < n["people_count"]]
    alerts = []
    for d in deficit:
        best = None
        best_dist = float("inf")
        for s in surplus:
            dist = haversine(d["latitude"], d["longitude"], s["latitude"], s["longitude"])
            if dist < best_dist:
                best_dist = dist
                best = s
        if best:
            transfer = min(
                best["food_available"] - best["people_count"],
                d["people_count"] - d["food_available"]
            )
            alerts.append({
                "from": best["ngo_name"],
                "to": d["ngo_name"],
                "meals_to_transfer": transfer,
                "distance_km": round(best_dist, 2),
                "urgency": "HIGH" if (d["people_count"] - d["food_available"]) > 100 else "MEDIUM"
            })
    return sorted(alerts, key=lambda x: x["distance_km"])
