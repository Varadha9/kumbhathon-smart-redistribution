package com.kumbhanna.redistribution.controller;

import com.kumbhanna.redistribution.model.Ngo;
import com.kumbhanna.redistribution.model.User;
import com.kumbhanna.redistribution.service.DataStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired private DataStore store;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody Map<String, Object> body) {
        String name     = (String) body.get("name");
        String email    = (String) body.get("email");
        String password = (String) body.get("password");
        String role     = (String) body.get("role");

        if (name == null || email == null || password == null || role == null)
            return ResponseEntity.badRequest().body(Map.of("error", "Missing fields"));
        if (store.users.containsKey(email))
            return ResponseEntity.status(409).body(Map.of("error", "Email already registered"));

        User user = User.builder()
            .name(name).email(email)
            .password(encoder.encode(password))
            .role(role)
            .contact((String) body.getOrDefault("contact", ""))
            .build();

        if ("ngo".equals(role)) {
            if (!body.containsKey("latitude") || !body.containsKey("longitude") || !body.containsKey("location"))
                return ResponseEntity.badRequest().body(Map.of("error", "NGO requires location, latitude, longitude"));

            store.ngos.put(name, Ngo.builder()
                .ngoName(name)
                .location((String) body.get("location"))
                .kumbhZone((String) body.getOrDefault("kumbh_zone", ""))
                .latitude(Double.parseDouble(body.get("latitude").toString()))
                .longitude(Double.parseDouble(body.get("longitude").toString()))
                .contact((String) body.getOrDefault("contact", ""))
                .foodAvailable(0).peopleCount(0)
                .timestamp(LocalDateTime.now().toString())
                .build());
        }

        store.users.put(email, user);
        return ResponseEntity.status(201).body(Map.of(
            "message", "Signup successful",
            "user", Map.of("name", user.getName(), "email", user.getEmail(),
                           "role", user.getRole(), "contact", user.getContact())
        ));
    }

    @PostMapping("/signin")
    public ResponseEntity<?> signin(@RequestBody Map<String, String> body) {
        String email    = body.get("email");
        String password = body.get("password");
        User user = store.users.get(email);
        if (user == null || !encoder.matches(password, user.getPassword()))
            return ResponseEntity.status(401).body(Map.of("error", "Invalid email or password"));
        return ResponseEntity.ok(Map.of(
            "message", "Login successful",
            "user", Map.of("name", user.getName(), "email", user.getEmail(),
                           "role", user.getRole(), "contact", user.getContact())
        ));
    }
}
