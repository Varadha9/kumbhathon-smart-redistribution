package com.kumbhanna.redistribution.controller;

import com.kumbhanna.redistribution.model.Alert;
import com.kumbhanna.redistribution.model.Ngo;
import com.kumbhanna.redistribution.service.DataStore;
import com.kumbhanna.redistribution.service.MatchingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api")
public class NgoController {

    @Autowired private DataStore      store;
    @Autowired private MatchingService matcher;

    // ── Register NGO (admin only — enforced in SecurityConfig) ────────────────

    @PostMapping("/ngo/register")
    public ResponseEntity<?> registerNgo(@RequestBody Map<String, Object> body) {
        for (String f : List.of("ngo_name", "location", "latitude", "longitude", "contact"))
            if (!body.containsKey(f)) return ResponseEntity.badRequest().body(Map.of("error", "Missing fields"));

        String name = ((String) body.get("ngo_name")).trim();
        if (name.isEmpty() || name.length() > 100)
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid NGO name"));

        if (store.ngos.containsKey(name))
            return ResponseEntity.status(409).body(Map.of("error", "NGO with this name already exists"));

        Ngo ngo = Ngo.builder()
            .ngoName(name)
            .location((String) body.get("location"))
            .kumbhZone((String) body.getOrDefault("kumbh_zone", ""))
            .latitude(Double.parseDouble(body.get("latitude").toString()))
            .longitude(Double.parseDouble(body.get("longitude").toString()))
            .contact((String) body.get("contact"))
            .foodAvailable(0).peopleCount(0)
            .timestamp(LocalDateTime.now().toString())
            .build();
        store.ngos.put(name, ngo);
        return ResponseEntity.ok(Map.of("message", "NGO registered", "ngo", ngo));
    }

    // ── Update NGO food data ──────────────────────────────────────────────────

    @PostMapping("/ngo/update")
    public ResponseEntity<?> updateNgo(@RequestBody Map<String, Object> body) {
        String name = (String) body.get("ngo_name");
        if (name == null) return ResponseEntity.badRequest().body(Map.of("error", "ngo_name required"));

        Ngo ngo = store.ngos.get(name);
        if (ngo == null) return ResponseEntity.status(404).body(Map.of("error", "NGO not found"));

        if (body.containsKey("food_available")) {
            int val = Integer.parseInt(body.get("food_available").toString());
            if (val < 0) return ResponseEntity.badRequest().body(Map.of("error", "food_available cannot be negative"));
            ngo.setFoodAvailable(val);
        }
        if (body.containsKey("people_count")) {
            int val = Integer.parseInt(body.get("people_count").toString());
            if (val < 0) return ResponseEntity.badRequest().body(Map.of("error", "people_count cannot be negative"));
            ngo.setPeopleCount(val);
        }
        ngo.setTimestamp(LocalDateTime.now().toString());
        store.ngoRepo.save(ngo);
        return ResponseEntity.ok(Map.of("message", "Updated", "ngo", ngo));
    }

    // ── List all NGOs ─────────────────────────────────────────────────────────

    @GetMapping("/ngos")
    public List<Ngo> getNgos() {
        return new ArrayList<>(store.ngos.values());
    }

    // ── AI Alerts ─────────────────────────────────────────────────────────────

    @GetMapping("/alerts")
    public List<Alert> getAlerts() {
        if (store.ngos.size() < 2) return List.of();
        return matcher.computeAlerts(store.ngos.values());
    }

    // ── Platform Stats ────────────────────────────────────────────────────────

    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        int totalFood  = store.ngos.values().stream().mapToInt(Ngo::getFoodAvailable).sum();
        int totalNeed  = store.ngos.values().stream().mapToInt(Ngo::getPeopleCount).sum();
        int mealsSaved = store.transfers.stream().mapToInt(t -> t.getMealsToTransfer()).sum();
        long pending   = store.donations.stream().filter(d -> "pending".equals(d.getStatus())).count();
        return Map.of(
            "total_ngos",           store.ngos.size(),
            "total_food_available", totalFood,
            "total_people_to_feed", totalNeed,
            "meals_redistributed",  mealsSaved,
            "active_donations",     pending,
            "completed_transfers",  store.transfers.size()
        );
    }

    // ── Kumbh Impact Stats ────────────────────────────────────────────────────

    @GetMapping("/impact")
    public Map<String, Object> getImpact() {
        int mealsSaved = store.transfers.stream().mapToInt(t -> t.getMealsToTransfer()).sum();
        long zones     = store.ngos.values().stream()
            .map(Ngo::getKumbhZone).filter(z -> z != null && !z.isBlank()).distinct().count();
        return Map.of(
            "meals_saved_at_kumbh", mealsSaved,
            "zones_covered",        zones,
            "co2_saved_kg",         Math.round(mealsSaved * 0.5 * 10.0) / 10.0,
            "water_saved_litres",   mealsSaved * 200,
            "pilgrims_served",      (int)(mealsSaved * 1.2)
        );
    }

    // ── Demo Seed (admin only — enforced in SecurityConfig) ───────────────────

    @PostMapping("/seed")
    public ResponseEntity<?> seed() {
        List<Ngo> demo = List.of(
            Ngo.builder().ngoName("Sangam Seva Samiti")  .location("Sangam Ghat, Prayagraj") .kumbhZone("Zone A - Sangam")   .latitude(25.4358).longitude(81.8463).contact("9800000001").foodAvailable(800).peopleCount(300).timestamp(LocalDateTime.now().toString()).build(),
            Ngo.builder().ngoName("Triveni Bhandara")    .location("Triveni Ghat, Prayagraj").kumbhZone("Zone A - Sangam")   .latitude(25.4401).longitude(81.8401).contact("9800000002").foodAvailable(120).peopleCount(600).timestamp(LocalDateTime.now().toString()).build(),
            Ngo.builder().ngoName("Ganga Aarti Trust")   .location("Ganga Ghat, Prayagraj")  .kumbhZone("Zone B - Ganga")    .latitude(25.4500).longitude(81.8350).contact("9800000003").foodAvailable(950).peopleCount(200).timestamp(LocalDateTime.now().toString()).build(),
            Ngo.builder().ngoName("Yamuna Pilgrim Camp") .location("Yamuna Bank, Prayagraj") .kumbhZone("Zone B - Ganga")    .latitude(25.4280).longitude(81.8550).contact("9800000004").foodAvailable(80) .peopleCount(500).timestamp(LocalDateTime.now().toString()).build(),
            Ngo.builder().ngoName("Kalpvasi Annakshetra").location("Sector 12, Prayagraj")   .kumbhZone("Zone C - Tent City").latitude(25.4200).longitude(81.8700).contact("9800000005").foodAvailable(700).peopleCount(150).timestamp(LocalDateTime.now().toString()).build(),
            Ngo.builder().ngoName("Maha Kumbh Rasoi")   .location("Sector 18, Prayagraj")   .kumbhZone("Zone C - Tent City").latitude(25.4150).longitude(81.8750).contact("9800000006").foodAvailable(60) .peopleCount(450).timestamp(LocalDateTime.now().toString()).build()
        );
        demo.forEach(n -> store.ngos.put(n.getNgoName(), n));
        return ResponseEntity.ok(Map.of("message", "Kumbh demo data loaded", "count", demo.size()));
    }
}
