package com.kumbhanna.redistribution.service;

import com.kumbhanna.redistribution.model.VisitorToken;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AllocationService {

    // Food distribution centers at Kumbh Mela — each has a capacity per 30-min slot
    public static final List<String> CENTERS = List.of(
        "Sangam Ghat Bhandara",
        "Triveni Rasoi",
        "Ganga Seva Kitchen",
        "Yamuna Camp Langar",
        "Tent City Annakshetra",
        "Sector 18 Maha Rasoi"
    );

    // Time slots for food distribution (30-min windows, 6am to 9pm)
    public static final List<String> TIME_SLOTS = List.of(
        "06:00 - 06:30", "06:30 - 07:00",
        "07:00 - 07:30", "07:30 - 08:00",
        "08:00 - 08:30", "08:30 - 09:00",
        "09:00 - 09:30", "09:30 - 10:00",
        "11:00 - 11:30", "11:30 - 12:00",
        "12:00 - 12:30", "12:30 - 13:00",
        "13:00 - 13:30", "13:30 - 14:00",
        "17:00 - 17:30", "17:30 - 18:00",
        "18:00 - 18:30", "18:30 - 19:00",
        "19:00 - 19:30", "19:30 - 20:00",
        "20:00 - 20:30", "20:30 - 21:00"
    );

    // Max visitors per center per time slot — keeps crowd balanced
    private static final int SLOT_CAPACITY = 50;

    /**
     * AI demand multiplier based on time of day — same logic as MatchingService
     * but used here to predict which slots will fill fastest.
     */
    public double getDemandMultiplier() {
        int hour = LocalTime.now().getHour();
        if (hour >= 4  && hour < 7)  return 1.8;
        if (hour >= 7  && hour < 10) return 1.5;
        if (hour >= 11 && hour < 14) return 1.3;
        if (hour >= 17 && hour < 20) return 1.6;
        if (hour >= 20 && hour < 23) return 1.2;
        return 0.9;
    }

    /**
     * Smart allocation — picks the food center + time slot with the least load.
     * This balances crowd across all centers and prevents queues.
     *
     * @param existingTokens all currently registered visitors
     * @param preferredZone  visitor's Kumbh zone (used to prefer nearby center)
     * @return [centerName, timeSlot]
     */
    public String[] allocate(List<VisitorToken> existingTokens, String preferredZone) {
        // Count current load per center+slot combination
        Map<String, Integer> load = new HashMap<>();
        for (VisitorToken t : existingTokens) {
            if ("pending".equals(t.getStatus()) || "served".equals(t.getStatus())) {
                String key = t.getFoodCenter() + "|" + t.getTimeSlot();
                load.merge(key, t.getPartySize(), Integer::sum);
            }
        }

        // Find the next upcoming time slot (don't allocate past slots)
        String nextSlot = getNextAvailableSlot();

        // Try to find least-loaded center for the next few slots
        String bestCenter = null;
        String bestSlot   = null;
        int    bestLoad   = Integer.MAX_VALUE;

        // Check next 6 slots (3 hours window)
        int startIdx = TIME_SLOTS.indexOf(nextSlot);
        if (startIdx < 0) startIdx = 0;
        int endIdx = Math.min(startIdx + 6, TIME_SLOTS.size());

        // Zone-to-center preference mapping
        Map<String, String> zoneCenter = Map.of(
            "Zone A - Sangam",    "Sangam Ghat Bhandara",
            "Zone B - Ganga",     "Ganga Seva Kitchen",
            "Zone C - Tent City", "Tent City Annakshetra",
            "Zone D - Yamuna",    "Yamuna Camp Langar",
            "Zone E - Outer Camp","Sector 18 Maha Rasoi"
        );
        String preferredCenter = zoneCenter.getOrDefault(preferredZone, null);

        for (int si = startIdx; si < endIdx; si++) {
            String slot = TIME_SLOTS.get(si);
            for (String center : CENTERS) {
                String key     = center + "|" + slot;
                int    current = load.getOrDefault(key, 0);
                if (current >= SLOT_CAPACITY) continue; // slot full

                // Prefer zone-matched center, give it a load bonus
                int effectiveLoad = current;
                if (preferredCenter != null && center.equals(preferredCenter)) {
                    effectiveLoad -= 10; // bias toward preferred center
                }

                if (effectiveLoad < bestLoad) {
                    bestLoad   = effectiveLoad;
                    bestCenter = center;
                    bestSlot   = slot;
                }
            }
        }

        // Fallback: if all slots in window are full, just pick least loaded overall
        if (bestCenter == null) {
            bestSlot   = TIME_SLOTS.get(startIdx);
            bestCenter = CENTERS.get(0);
        }

        return new String[]{ bestCenter, bestSlot };
    }

    /**
     * Returns the next upcoming 30-min time slot from current time.
     */
    private String getNextAvailableSlot() {
        int hour   = LocalTime.now().getHour();
        int minute = LocalTime.now().getMinute();
        // Round up to next 30-min boundary
        int nextHour = minute < 30 ? hour : hour + 1;
        int nextMin  = minute < 30 ? 30   : 0;
        String target = String.format("%02d:%02d", nextHour, nextMin);

        for (String slot : TIME_SLOTS) {
            if (slot.compareTo(target) >= 0) return slot;
        }
        return TIME_SLOTS.get(0); // wrap to first slot
    }

    /**
     * Generate crowd load stats per center — used for AI insights dashboard.
     */
    public Map<String, Object> getCrowdStats(List<VisitorToken> tokens) {
        Map<String, Long> perCenter = new LinkedHashMap<>();
        for (String c : CENTERS) perCenter.put(c, 0L);

        tokens.stream()
            .filter(t -> "pending".equals(t.getStatus()) || "served".equals(t.getStatus()))
            .forEach(t -> perCenter.merge(t.getFoodCenter(), (long) t.getPartySize(), Long::sum));

        long totalRegistered = tokens.size();
        long totalServed     = tokens.stream().filter(t -> "served".equals(t.getStatus())).count();
        long totalPending    = tokens.stream().filter(t -> "pending".equals(t.getStatus())).count();
        long totalNoShow     = tokens.stream().filter(t -> "no_show".equals(t.getStatus())).count();
        int  totalMeals      = tokens.stream().filter(t -> "served".equals(t.getStatus()))
                                     .mapToInt(VisitorToken::getPartySize).sum();

        return Map.of(
            "per_center",        perCenter,
            "total_registered",  totalRegistered,
            "total_served",      totalServed,
            "total_pending",     totalPending,
            "total_no_show",     totalNoShow,
            "total_meals_served",totalMeals,
            "demand_multiplier", getDemandMultiplier()
        );
    }
}
