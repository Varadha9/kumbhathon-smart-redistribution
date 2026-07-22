package com.kumbhanna.redistribution.controller;

import com.kumbhanna.redistribution.model.Feedback;
import com.kumbhanna.redistribution.model.VisitorToken;
import com.kumbhanna.redistribution.service.AllocationService;
import com.kumbhanna.redistribution.service.DataStore;
import com.kumbhanna.redistribution.service.WhatsAppService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;

@RestController
@RequestMapping("/api/visitor")
public class VisitorController {

    @Autowired private DataStore        store;
    @Autowired private AllocationService allocator;
    @Autowired private WhatsAppService  whatsApp;

    // Thread-safe token counter
    private final AtomicInteger counter = new AtomicInteger(1);

    // ── STEP 1: Visitor Registration → QR Token ───────────────────────────────

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, Object> body) {
        String name  = (String) body.get("visitor_name");
        String phone = (String) body.get("phone");
        String zone  = (String) body.getOrDefault("kumbh_zone", "");
        int    party = Integer.parseInt(body.getOrDefault("party_size", 1).toString());

        if (name == null || name.isBlank())
            return ResponseEntity.badRequest().body(Map.of("error", "visitor_name is required"));
        if (party < 1 || party > 20)
            return ResponseEntity.badRequest().body(Map.of("error", "party_size must be 1–20"));

        // STEP 2 & 3: AI allocates food center + time slot
        List<VisitorToken> allTokens = store.visitorTokenRepo.findAll();
        String[] allocation = allocator.allocate(allTokens, zone);
        String center   = allocation[0];
        String timeSlot = allocation[1];

        // Generate unique token ID
        String tokenId = String.format("KA-%05d", counter.getAndIncrement());

        VisitorToken token = VisitorToken.builder()
            .tokenId(tokenId)
            .visitorName(name.trim())
            .phone(phone != null ? phone.trim() : "")
            .kumbhZone(zone)
            .foodCenter(center)
            .timeSlot(timeSlot)
            .partySize(party)
            .status("pending")
            .registeredAt(LocalDateTime.now().toString())
            .build();

        store.visitorTokenRepo.save(token);

        // WhatsApp confirmation to visitor
        if (phone != null && !phone.isBlank()) {
            whatsApp.send(phone, String.format(
                "🪔 *KumbhAnna — Your Food Token*\n\n" +
                "Token: *%s*\n" +
                "Name: %s (Party of %d)\n\n" +
                "📍 *Food Center:* %s\n" +
                "⏰ *Time Slot:* %s\n\n" +
                "Please arrive at your assigned center at the given time.\n" +
                "Show this message or your QR code at the counter.\n\n" +
                "🙏 Jai Ganga Maiya — KumbhAnna",
                tokenId, name, party, center, timeSlot));
        }

        return ResponseEntity.ok(Map.of(
            "token_id",    tokenId,
            "visitor_name",name,
            "party_size",  party,
            "food_center", center,
            "time_slot",   timeSlot,
            "kumbh_zone",  zone,
            "status",      "pending",
            "registered_at", token.getRegisteredAt(),
            "whatsapp_sent", whatsApp.isEnabled() && phone != null && !phone.isBlank(),
            "message",     "Registration successful! Please go to " + center + " at " + timeSlot
        ));
    }

    // ── STEP 4: QR Scan → Food Served ─────────────────────────────────────────

    @PostMapping("/scan")
    public ResponseEntity<?> scan(@RequestBody Map<String, String> body) {
        String tokenId = body.get("token_id");
        if (tokenId == null || tokenId.isBlank())
            return ResponseEntity.badRequest().body(Map.of("error", "token_id is required"));

        return store.visitorTokenRepo.findById(tokenId.toUpperCase().trim())
            .map(token -> {
                if ("served".equals(token.getStatus()))
                    return ResponseEntity.status(409).body(Map.of(
                        "error", "Token already used",
                        "token", token
                    ));
                if ("no_show".equals(token.getStatus()))
                    return ResponseEntity.status(410).body(Map.of(
                        "error", "Token expired (no-show)",
                        "token", token
                    ));

                token.setStatus("served");
                token.setServedAt(LocalDateTime.now().toString());
                store.visitorTokenRepo.save(token);

                // Update NGO food count for the matched center
                store.ngos.values().stream()
                    .filter(n -> n.getNgoName().contains(token.getFoodCenter().split(" ")[0]))
                    .findFirst()
                    .ifPresent(ngo -> {
                        ngo.setFoodAvailable(Math.max(0, ngo.getFoodAvailable() - token.getPartySize()));
                        store.ngoRepo.save(ngo);
                    });

                return ResponseEntity.ok(Map.of(
                    "message",      "✅ Food served successfully!",
                    "token_id",     token.getTokenId(),
                    "visitor_name", token.getVisitorName(),
                    "party_size",   token.getPartySize(),
                    "food_center",  token.getFoodCenter(),
                    "served_at",    token.getServedAt()
                ));
            })
            .orElse(ResponseEntity.status(404).body(Map.of("error", "Token not found: " + tokenId)));
    }

    // ── STEP 5: Feedback ──────────────────────────────────────────────────────

    @PostMapping("/feedback")
    public ResponseEntity<?> feedback(@RequestBody Map<String, Object> body) {
        String tokenId = (String) body.get("token_id");
        if (tokenId == null || tokenId.isBlank())
            return ResponseEntity.badRequest().body(Map.of("error", "token_id is required"));

        int rating = Integer.parseInt(body.getOrDefault("rating", 3).toString());
        if (rating < 1 || rating > 5)
            return ResponseEntity.badRequest().body(Map.of("error", "rating must be 1–5"));

        // Look up which center this token was served at
        String center = store.visitorTokenRepo.findById(tokenId.toUpperCase().trim())
            .map(VisitorToken::getFoodCenter)
            .orElse("Unknown");

        Feedback fb = Feedback.builder()
            .tokenId(tokenId.toUpperCase().trim())
            .foodCenter(center)
            .rating(rating)
            .comment((String) body.getOrDefault("comment", ""))
            .foodQuality((String) body.getOrDefault("food_quality", ""))
            .waitTime((String) body.getOrDefault("wait_time", ""))
            .timestamp(LocalDateTime.now().toString())
            .build();

        store.feedbackRepo.save(fb);

        return ResponseEntity.ok(Map.of(
            "message",     "Thank you for your feedback! 🙏",
            "feedback_id", fb.getId(),
            "rating",      rating
        ));
    }

    // ── Lookup token by ID ────────────────────────────────────────────────────

    @GetMapping("/token/{tokenId}")
    public ResponseEntity<?> getToken(@PathVariable String tokenId) {
        return store.visitorTokenRepo.findById(tokenId.toUpperCase().trim())
            .map(t -> ResponseEntity.ok((Object) t))
            .orElse(ResponseEntity.status(404).body(Map.of("error", "Token not found")));
    }

    // ── List all tokens (admin) ───────────────────────────────────────────────

    @GetMapping("/tokens")
    public List<VisitorToken> getAllTokens() {
        return store.visitorTokenRepo.findAll();
    }

    // ── All feedback (admin) ──────────────────────────────────────────────────

    @GetMapping("/feedbacks")
    public List<Feedback> getAllFeedbacks() {
        return store.feedbackRepo.findAll();
    }

    // ── AI Insights — Step 5 ──────────────────────────────────────────────────

    @GetMapping("/insights")
    public Map<String, Object> getInsights() {
        List<VisitorToken> tokens    = store.visitorTokenRepo.findAll();
        List<Feedback>     feedbacks = store.feedbackRepo.findAll();

        Map<String, Object> crowdStats = allocator.getCrowdStats(tokens);

        // Feedback insights
        double avgRating = feedbacks.stream()
            .mapToInt(Feedback::getRating).average().orElse(0.0);

        Map<String, Long> ratingDist = new LinkedHashMap<>();
        for (int i = 5; i >= 1; i--) {
            final int r = i;
            ratingDist.put(i + " ⭐", feedbacks.stream().filter(f -> f.getRating() == r).count());
        }

        Map<String, Long> qualityDist = new LinkedHashMap<>();
        feedbacks.stream().map(Feedback::getFoodQuality)
            .filter(q -> q != null && !q.isBlank())
            .forEach(q -> qualityDist.merge(q, 1L, Long::sum));

        Map<String, Long> waitDist = new LinkedHashMap<>();
        feedbacks.stream().map(Feedback::getWaitTime)
            .filter(w -> w != null && !w.isBlank())
            .forEach(w -> waitDist.merge(w, 1L, Long::sum));

        // Waste estimate: no-shows × avg party size × 1 meal
        long noShows = tokens.stream().filter(t -> "no_show".equals(t.getStatus())).count();
        double avgParty = tokens.stream().mapToInt(VisitorToken::getPartySize).average().orElse(1.0);
        long wasteEstimate = (long)(noShows * avgParty);

        return Map.of(
            "crowd_stats",       crowdStats,
            "avg_rating",        Math.round(avgRating * 10.0) / 10.0,
            "total_feedbacks",   feedbacks.size(),
            "rating_distribution", ratingDist,
            "quality_distribution", qualityDist,
            "wait_distribution", waitDist,
            "waste_meals_estimate", wasteEstimate,
            "centers",           AllocationService.CENTERS,
            "time_slots",        AllocationService.TIME_SLOTS
        );
    }

    // ── Mark no-shows (admin batch action) ───────────────────────────────────

    @PostMapping("/no-show/{tokenId}")
    public ResponseEntity<?> markNoShow(@PathVariable String tokenId) {
        return store.visitorTokenRepo.findById(tokenId.toUpperCase().trim())
            .map(t -> {
                if ("served".equals(t.getStatus()))
                    return ResponseEntity.badRequest().body(Map.of("error", "Already served"));
                t.setStatus("no_show");
                store.visitorTokenRepo.save(t);
                return ResponseEntity.ok(Map.of("message", "Marked as no-show", "token_id", tokenId));
            })
            .orElse(ResponseEntity.status(404).body(Map.of("error", "Token not found")));
    }
}
