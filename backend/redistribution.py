# redistribution.py
# This is the CORE AI ENGINE of the app.
# It decides: which NGO has surplus food, which has deficit,
# how far apart they are, and how many meals to transfer.

from math import radians, sin, cos, sqrt, atan2

def haversine(lat1, lon1, lat2, lon2):
    """
    Calculates the straight-line distance (in km) between two GPS points on Earth.
    Uses the Haversine formula — accounts for Earth's curvature.
    Used to find the NEAREST surplus NGO for each deficit NGO.
    """
    R = 6371  # Earth's radius in kilometers
    dlat = radians(lat2 - lat1)           # difference in latitude, converted to radians
    dlon = radians(lon2 - lon1)           # difference in longitude, converted to radians
    a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)**2
    return R * 2 * atan2(sqrt(a), sqrt(1 - a))  # final distance in km

def compute_alerts(ngos):
    """
    Main AI function — takes a list of all NGOs and returns transfer suggestions.
    Steps:
      1. Split NGOs into surplus (have extra food) and deficit (need more food)
      2. For each deficit NGO, find the nearest surplus NGO using Haversine distance
      3. Calculate how many meals to transfer (limited by what surplus can give)
      4. Assign urgency level based on how badly the deficit NGO needs food
      5. Return alerts sorted by distance (closest first = fastest delivery)
    """

    # Step 1: Classify NGOs
    # Surplus = food available is MORE than people they need to feed
    surplus = [n for n in ngos if n["food_available"] > n["people_count"]]
    # Deficit = food available is LESS than people they need to feed
    deficit = [n for n in ngos if n["food_available"] < n["people_count"]]

    alerts = []

    # Step 2: For each NGO that needs food, find the best donor NGO
    for d in deficit:
        best = None          # will hold the best surplus NGO found
        best_dist = float("inf")  # start with infinity so any real distance is smaller

        for s in surplus:
            # Calculate distance between this deficit NGO and this surplus NGO
            dist = haversine(d["latitude"], d["longitude"], s["latitude"], s["longitude"])
            if dist < best_dist:
                # This surplus NGO is closer — update our best match
                best_dist = dist
                best = s

        if best:
            # Step 3: Calculate how many meals to transfer
            # Can't give more than the surplus NGO has extra
            # Can't give more than the deficit NGO needs
            transfer = min(
                best["food_available"] - best["people_count"],  # max surplus NGO can give
                d["people_count"] - d["food_available"]         # max deficit NGO needs
            )

            # Step 4: Assign urgency — HIGH if deficit is more than 100 meals
            urgency = "HIGH" if (d["people_count"] - d["food_available"]) > 100 else "MEDIUM"

            alerts.append({
                "from": best["ngo_name"],          # surplus NGO (sender)
                "to": d["ngo_name"],               # deficit NGO (receiver)
                "meals_to_transfer": transfer,     # number of meals to move
                "distance_km": round(best_dist, 2),# distance between them
                "urgency": urgency                 # HIGH or MEDIUM
            })

    # Step 5: Sort by distance — closest transfers appear first (faster to execute)
    return sorted(alerts, key=lambda x: x["distance_km"])
