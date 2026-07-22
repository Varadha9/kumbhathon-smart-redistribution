package com.kumbhanna.redistribution.model;

import jakarta.persistence.*;

@Entity
@Table(name = "donations")
public class Donation {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int    id;
    private String donorName;
    private int    foodQuantity;
    private String foodType;
    private double latitude;
    private double longitude;
    private int    expiryHours;
    private String matchedNgo;
    private String status;
    private String timestamp;

    public Donation() {}

    public int    getId()           { return id; }
    public String getDonorName()    { return donorName; }
    public int    getFoodQuantity() { return foodQuantity; }
    public String getFoodType()     { return foodType; }
    public double getLatitude()     { return latitude; }
    public double getLongitude()    { return longitude; }
    public int    getExpiryHours()  { return expiryHours; }
    public String getMatchedNgo()   { return matchedNgo; }
    public String getStatus()       { return status; }
    public String getTimestamp()    { return timestamp; }

    public void setId(int v)           { this.id = v; }
    public void setDonorName(String v) { this.donorName = v; }
    public void setFoodQuantity(int v) { this.foodQuantity = v; }
    public void setFoodType(String v)  { this.foodType = v; }
    public void setLatitude(double v)  { this.latitude = v; }
    public void setLongitude(double v) { this.longitude = v; }
    public void setExpiryHours(int v)  { this.expiryHours = v; }
    public void setMatchedNgo(String v){ this.matchedNgo = v; }
    public void setStatus(String v)    { this.status = v; }
    public void setTimestamp(String v) { this.timestamp = v; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private final Donation d = new Donation();
        public Builder id(int v)           { d.id = v;           return this; }
        public Builder donorName(String v) { d.donorName = v;    return this; }
        public Builder foodQuantity(int v) { d.foodQuantity = v; return this; }
        public Builder foodType(String v)  { d.foodType = v;     return this; }
        public Builder latitude(double v)  { d.latitude = v;     return this; }
        public Builder longitude(double v) { d.longitude = v;    return this; }
        public Builder expiryHours(int v)  { d.expiryHours = v;  return this; }
        public Builder matchedNgo(String v){ d.matchedNgo = v;   return this; }
        public Builder status(String v)    { d.status = v;       return this; }
        public Builder timestamp(String v) { d.timestamp = v;    return this; }
        public Donation build() { return d; }
    }
}
