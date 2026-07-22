package com.kumbhanna.redistribution.controller;

import com.kumbhanna.redistribution.model.Donation;
import com.kumbhanna.redistribution.model.Ngo;
import com.kumbhanna.redistribution.model.Transfer;
import com.kumbhanna.redistribution.service.DataStore;
import com.kumbhanna.redistribution.service.MatchingService;
import com.kumbhanna.redistribution.service.WhatsAppService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api")
public class TransferController {

    @Autowired private DataStore       store;
    @Autowired private MatchingService matcher;
    @Autowired private WhatsAppService whatsApp;

    // ── Confirm Transfer ──────────────────────────────────────────────────────

    @PostMapping("/transfer/confirm")
    public ResponseEntity<?> confirmTransfer(@RequestBody Map<String, Object> body) {
        String from = (String) body.get("from");
        String to   = (String) body.get("to");

        if (from == null || to == null)
            return ResponseEntity.badRequest().body(Map.of("error", "Missing from/to fields"));

        int    meals  = Integer.parseInt(body.getOrDefault("meals_to_transfer", 0).toString());
        double distKm = Double.parseDouble(body.getOrDefault("distance_km", 0).toString());

        if (meals <= 0)
            return ResponseEntity.badRequest().body(Map.of("error", "meals_to_transfer must be > 0"));

        // Let @GeneratedValue handle the ID — do NOT set it manually
        Transfer transfer = Transfer.builder()
            .from(from).to(to)
            .mealsToTransfer(meals)
            .distanceKm(distKm)
            .urgency((String) body.getOrDefault("urgency", ""))
            .status("completed")
            .timestamp(LocalDateTime.now().toString())
            .build();
        store.transfers.add(transfer);

        // Update food counts
        Ngo fromNgo = store.ngos.get(from);
        Ngo toNgo   = store.ngos.get(to);
        if (fromNgo != null) {
            fromNgo.setFoodAvailable(Math.max(0, fromNgo.getFoodAvailable() - meals));
            store.ngoRepo.save(fromNgo);
        }
        if (toNgo != null) {
            toNgo.setFoodAvailable(toNgo.getFoodAvailable() + meals);
            store.ngoRepo.save(toNgo);
        }

        // WhatsApp to both NGOs
        if (fromNgo != null) {
            whatsApp.send(fromNgo.getContact(), String.format(
                "🪔 *KumbhAnna Transfer Alert*\nPrepare *%d meals* for dispatch.\nDestination: %s (%s)\nDistance: %.2f km\nA volunteer will be assigned shortly. — KumbhAnna",
                meals, to, toNgo != null ? toNgo.getKumbhZone() : "N/A", distKm));
        }
        if (toNgo != null) {
            whatsApp.send(toNgo.getContact(), String.format(
                "🪔 *KumbhAnna Transfer Alert*\n*%d meals* are being sent to your camp!\nFrom: %s (%s)\nDistance: %.2f km\nA volunteer will deliver shortly. — KumbhAnna",
                meals, from, fromNgo != null ? fromNgo.getKumbhZone() : "N/A", distKm));
        }

        return ResponseEntity.ok(Map.of(
            "message", "Transfer confirmed",
            "transfer", transfer,
            "whatsapp", Map.of("twilio_enabled", whatsApp.isEnabled())
        ));
    }

    // ── Donate ────────────────────────────────────────────────────────────────

    @PostMapping("/donate")
    public ResponseEntity<?> donate(@RequestBody Map<String, Object> body) {
        for (String f : List.of("donor_name", "food_quantity", "food_type", "latitude", "longitude", "expiry_hours"))
            if (!body.containsKey(f)) return ResponseEntity.badRequest().body(Map.of("error", "Missing fields"));

        String donorName = ((String) body.get("donor_name")).trim();
        if (donorName.isEmpty() || donorName.length() > 100)
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid donor name"));

        int qty = Integer.parseInt(body.get("food_quantity").toString());
        if (qty <= 0) return ResponseEntity.badRequest().body(Map.of("error", "food_quantity must be > 0"));

        // Let @GeneratedValue handle the ID
        Donation donation = Donation.builder()
            .donorName(donorName)
            .foodQuantity(qty)
            .foodType((String) body.get("food_type"))
            .latitude(Double.parseDouble(body.get("latitude").toString()))
            .longitude(Double.parseDouble(body.get("longitude").toString()))
            .expiryHours(Integer.parseInt(body.get("expiry_hours").toString()))
            .status("pending")
            .timestamp(LocalDateTime.now().toString())
            .build();

        // Auto-match to nearest deficit NGO
        store.ngos.values().stream()
            .filter(n -> n.getFoodAvailable() < n.getPeopleCount())
            .min(Comparator.comparingDouble(n ->
                matcher.haversine(donation.getLatitude(), donation.getLongitude(), n.getLatitude(), n.getLongitude())))
            .ifPresent(nearest -> {
                donation.setMatchedNgo(nearest.getNgoName());
                donation.setStatus("matched");
                whatsApp.send(nearest.getContact(), String.format(
                    "🪔 *KumbhAnna Alert*\nNew food donation matched to your camp!\nDonor: %s\nQuantity: %d plates (%s)\nUse within: %d hours\nPlease confirm pickup. — KumbhAnna",
                    donation.getDonorName(), donation.getFoodQuantity(), donation.getFoodType(), donation.getExpiryHours()));
            });

        store.donations.add(donation);
        return ResponseEntity.ok(donation);
    }

    // ── History ───────────────────────────────────────────────────────────────

    @GetMapping("/history/transfers")
    public List<Transfer> getTransfers() { return store.transfers; }

    @GetMapping("/history/donations")
    public List<Donation> getDonations() { return store.donations; }
}
