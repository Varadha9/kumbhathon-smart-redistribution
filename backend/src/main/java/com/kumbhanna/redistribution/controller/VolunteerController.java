package com.kumbhanna.redistribution.controller;

import com.kumbhanna.redistribution.model.Ngo;
import com.kumbhanna.redistribution.model.VolunteerAssignment;
import com.kumbhanna.redistribution.service.DataStore;
import com.kumbhanna.redistribution.service.WhatsAppService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/volunteer")
public class VolunteerController {

    @Autowired private DataStore       store;
    @Autowired private WhatsAppService whatsApp;

    @PostMapping("/assign")
    public ResponseEntity<?> assign(@RequestBody Map<String, Object> body) {
        for (String f : List.of("volunteer_name", "volunteer_phone", "from_ngo", "to_ngo", "meals"))
            if (!body.containsKey(f)) return ResponseEntity.badRequest().body(Map.of("error", "Missing fields"));

        String volName  = (String) body.get("volunteer_name");
        String volPhone = (String) body.get("volunteer_phone");
        String fromNgo  = (String) body.get("from_ngo");
        String toNgo    = (String) body.get("to_ngo");
        int    meals    = Integer.parseInt(body.get("meals").toString());

        VolunteerAssignment assignment = VolunteerAssignment.builder()
            .id(store.volunteers.size() + 1)
            .volunteerName(volName).volunteerPhone(volPhone)
            .fromNgo(fromNgo).toNgo(toNgo).meals(meals)
            .status("dispatched")
            .timestamp(LocalDateTime.now().toString())
            .build();
        store.volunteers.add(assignment);

        Ngo from = store.ngos.get(fromNgo);
        Ngo to   = store.ngos.get(toNgo);

        // WhatsApp to volunteer
        whatsApp.send(volPhone, String.format(
            "🪔 *KumbhAnna Volunteer Dispatch*\nHello %s! You have been assigned a food delivery.\n\n📦 Pickup: %s\n   📍 %s (%s)\n\n📬 Deliver to: %s\n   📍 %s (%s)\n\n🍛 Quantity: %d meals\nPlease proceed immediately. Thank you! — KumbhAnna",
            volName,
            fromNgo, from != null ? from.getLocation() : "N/A", from != null ? from.getKumbhZone() : "N/A",
            toNgo,   to   != null ? to.getLocation()   : "N/A", to   != null ? to.getKumbhZone()   : "N/A",
            meals));

        // WhatsApp to receiving NGO
        if (to != null) {
            whatsApp.send(to.getContact(), String.format(
                "🪔 *KumbhAnna Volunteer Assigned*\nVolunteer *%s* is on the way with %d meals from %s.\nContact: %s — KumbhAnna",
                volName, meals, fromNgo, volPhone));
        }

        return ResponseEntity.ok(Map.of(
            "message", "Volunteer assigned",
            "assignment", assignment,
            "twilio_enabled", whatsApp.isEnabled()
        ));
    }

    @GetMapping("/list")
    public List<VolunteerAssignment> list() { return store.volunteers; }

    @PostMapping("/complete")
    public ResponseEntity<?> complete(@RequestBody Map<String, Object> body) {
        int id = Integer.parseInt(body.get("id").toString());
        return store.volunteers.stream()
            .filter(v -> v.getId() == id)
            .findFirst()
            .map(v -> {
                v.setStatus("delivered");
                v.setDeliveredAt(LocalDateTime.now().toString());
                return ResponseEntity.ok(Map.of("message", "Marked as delivered", "assignment", v));
            })
            .orElse(ResponseEntity.status(404).body(Map.of("error", "Assignment not found")));
    }

    @PostMapping("/notify")
    public ResponseEntity<?> notify(@RequestBody Map<String, String> body) {
        boolean sent = whatsApp.send(body.get("to_number"), body.get("message"));
        return ResponseEntity.ok(Map.of("sent", sent, "twilio_enabled", whatsApp.isEnabled()));
    }
}
