package com.kumbhanna.redistribution.service;

import com.kumbhanna.redistribution.model.Alert;
import com.kumbhanna.redistribution.model.Ngo;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MatchingService {

    /**
     * Haversine formula — straight-line distance in km between two GPS coordinates.
     */
    public double haversine(double lat1, double lon1, double lat2, double lon2) {
        final double R = 6371.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                 + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                 * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    /**
     * Time-of-day demand multiplier for Kumbh Mela.
     * Pilgrim meal demand spikes at Snan times and evening Aarti.
     * Returns [multiplier, reason].
     */
    public Object[] predictDemand() {
        int hour = LocalTime.now().getHour();
        if (hour >= 4  && hour < 7)  return new Object[]{1.8, "🌅 Early morning Snan rush — HIGH pilgrim activity"};
        if (hour >= 7  && hour < 10) return new Object[]{1.5, "🍳 Morning meal peak — camps filling up"};
        if (hour >= 11 && hour < 14) return new Object[]{1.3, "☀️ Midday meal rush"};
        if (hour >= 17 && hour < 20) return new Object[]{1.6, "🪔 Evening Aarti time — high crowd density"};
        if (hour >= 20 && hour < 23) return new Object[]{1.2, "🌙 Night meal distribution"};
        return new Object[]{0.9, "🌙 Low activity hours"};
    }

    /**
     * Main matching function.
     * 1. Split NGOs into surplus and deficit
     * 2. Apply time-based demand multiplier to deficit estimates
     * 3. Prefer same-zone matches for faster logistics
     * 4. Fall back to nearest cross-zone match
     * 5. Assign urgency: CRITICAL > 300, HIGH > 100, else MEDIUM
     * 6. Return sorted by distance ascending
     */
    public List<Alert> computeAlerts(Collection<Ngo> ngos) {
        Object[] demand       = predictDemand();
        double   multiplier   = (double) demand[0];
        String   demandReason = (String) demand[1];

        List<Ngo> surplus = ngos.stream().filter(n -> n.getFoodAvailable() > n.getPeopleCount()).collect(Collectors.toList());
        List<Ngo> deficit = ngos.stream().filter(n -> n.getFoodAvailable() < n.getPeopleCount()).collect(Collectors.toList());

        List<Alert> alerts = new ArrayList<>();

        for (Ngo d : deficit) {
            int effectiveNeed = (int) ((d.getPeopleCount() - d.getFoodAvailable()) * multiplier);

            Ngo    best         = null;
            double bestDist     = Double.MAX_VALUE;
            boolean sameZone   = false;

            // Pass 1: same-zone match
            for (Ngo s : surplus) {
                boolean isZoneMatch = !d.getKumbhZone().isEmpty()
                        && d.getKumbhZone().equals(s.getKumbhZone());
                if (!isZoneMatch) continue;
                double dist = haversine(d.getLatitude(), d.getLongitude(), s.getLatitude(), s.getLongitude());
                if (dist < bestDist) { bestDist = dist; best = s; sameZone = true; }
            }

            // Pass 2: nearest regardless of zone
            if (best == null) {
                for (Ngo s : surplus) {
                    double dist = haversine(d.getLatitude(), d.getLongitude(), s.getLatitude(), s.getLongitude());
                    if (dist < bestDist) { bestDist = dist; best = s; }
                }
            }

            if (best == null) continue;

            int transfer = Math.min(
                best.getFoodAvailable() - best.getPeopleCount(),
                effectiveNeed
            );

            int rawDeficit = d.getPeopleCount() - d.getFoodAvailable();
            String urgency = rawDeficit > 300 ? "CRITICAL" : rawDeficit > 100 ? "HIGH" : "MEDIUM";

            alerts.add(Alert.builder()
                .from(best.getNgoName())
                .to(d.getNgoName())
                .mealsToTransfer(transfer)
                .distanceKm(Math.round(bestDist * 100.0) / 100.0)
                .urgency(urgency)
                .sameZone(sameZone)
                .demandReason(demandReason)
                .fromZone(best.getKumbhZone().isEmpty() ? "—" : best.getKumbhZone())
                .toZone(d.getKumbhZone().isEmpty() ? "—" : d.getKumbhZone())
                .build());
        }

        alerts.sort(Comparator.comparingDouble(Alert::getDistanceKm));
        return alerts;
    }
}
