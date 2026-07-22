package com.kumbhanna.redistribution.model;

import jakarta.persistence.*;

@Entity
@Table(name = "visitor_tokens")
public class VisitorToken {

    @Id
    private String tokenId;       // unique QR code value e.g. "KA-00042"
    private String visitorName;
    private String phone;
    private String kumbhZone;
    private String foodCenter;    // AI-allocated food center name
    private String timeSlot;      // AI-allocated time slot e.g. "07:00 - 07:30"
    private String status;        // "pending" | "served" | "no_show"
    private int    partySize;     // number of people in group
    private String registeredAt;
    private String servedAt;

    public VisitorToken() {}

    public String getTokenId()      { return tokenId; }
    public String getVisitorName()  { return visitorName; }
    public String getPhone()        { return phone; }
    public String getKumbhZone()    { return kumbhZone; }
    public String getFoodCenter()   { return foodCenter; }
    public String getTimeSlot()     { return timeSlot; }
    public String getStatus()       { return status; }
    public int    getPartySize()    { return partySize; }
    public String getRegisteredAt() { return registeredAt; }
    public String getServedAt()     { return servedAt; }

    public void setTokenId(String v)      { this.tokenId = v; }
    public void setVisitorName(String v)  { this.visitorName = v; }
    public void setPhone(String v)        { this.phone = v; }
    public void setKumbhZone(String v)    { this.kumbhZone = v; }
    public void setFoodCenter(String v)   { this.foodCenter = v; }
    public void setTimeSlot(String v)     { this.timeSlot = v; }
    public void setStatus(String v)       { this.status = v; }
    public void setPartySize(int v)       { this.partySize = v; }
    public void setRegisteredAt(String v) { this.registeredAt = v; }
    public void setServedAt(String v)     { this.servedAt = v; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private final VisitorToken t = new VisitorToken();
        public Builder tokenId(String v)      { t.tokenId = v;      return this; }
        public Builder visitorName(String v)  { t.visitorName = v;  return this; }
        public Builder phone(String v)        { t.phone = v;        return this; }
        public Builder kumbhZone(String v)    { t.kumbhZone = v;    return this; }
        public Builder foodCenter(String v)   { t.foodCenter = v;   return this; }
        public Builder timeSlot(String v)     { t.timeSlot = v;     return this; }
        public Builder status(String v)       { t.status = v;       return this; }
        public Builder partySize(int v)       { t.partySize = v;    return this; }
        public Builder registeredAt(String v) { t.registeredAt = v; return this; }
        public Builder servedAt(String v)     { t.servedAt = v;     return this; }
        public VisitorToken build() { return t; }
    }
}
