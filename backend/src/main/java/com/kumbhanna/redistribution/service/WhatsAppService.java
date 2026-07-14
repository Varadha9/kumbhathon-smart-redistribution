package com.kumbhanna.redistribution.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;

@Service
public class WhatsAppService {

    @Value("${twilio.account-sid}")
    private String accountSid;

    @Value("${twilio.auth-token}")
    private String authToken;

    @Value("${twilio.whatsapp-from}")
    private String fromNumber;

    private boolean enabled = false;

    @PostConstruct
    public void init() {
        enabled = accountSid.startsWith("AC") && !authToken.equals("your_auth_token_here");
        if (enabled) {
            Twilio.init(accountSid, authToken);
        }
    }

    /**
     * Sends a WhatsApp message to an Indian mobile number.
     * Silently skips if Twilio is not configured — app works without it.
     */
    public boolean send(String toNumber, String body) {
        if (!enabled || toNumber == null || toNumber.isBlank()) return false;
        try {
            String cleaned = toNumber.replaceAll("[^0-9]", "");
            if (cleaned.length() < 10) return false;
            String to = "whatsapp:+91" + (cleaned.length() > 10 ? cleaned.substring(cleaned.length() - 10) : cleaned);
            Message.creator(new PhoneNumber(to), new PhoneNumber(fromNumber), body).create();
            return true;
        } catch (Exception e) {
            System.err.println("WhatsApp send failed: " + e.getMessage());
            return false;
        }
    }

    public boolean isEnabled() { return enabled; }
}
