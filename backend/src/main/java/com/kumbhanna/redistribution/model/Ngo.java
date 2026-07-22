package com.kumbhanna.redistribution.model;

import jakarta.persistence.*;

@Entity
@Table(name = "ngos")
public class Ngo {
    @Id
    private String ngoName;
    private String location;
    private String kumbhZone;
    private double latitude;
    private double longitude;
    private String contact;
    private int    foodAvailable;
    private int    peopleCount;
    private String timestamp;

    public Ngo() {}

    public String getNgoName()       { return ngoName; }
    public String getLocation()      { return location; }
    public String getKumbhZone()     { return kumbhZone == null ? "" : kumbhZone; }
    public double getLatitude()      { return latitude; }
    public double getLongitude()     { return longitude; }
    public String getContact()       { return contact; }
    public int    getFoodAvailable() { return foodAvailable; }
    public int    getPeopleCount()   { return peopleCount; }
    public String getTimestamp()     { return timestamp; }

    public void setNgoName(String v)       { this.ngoName = v; }
    public void setLocation(String v)      { this.location = v; }
    public void setKumbhZone(String v)     { this.kumbhZone = v; }
    public void setLatitude(double v)      { this.latitude = v; }
    public void setLongitude(double v)     { this.longitude = v; }
    public void setContact(String v)       { this.contact = v; }
    public void setFoodAvailable(int v)    { this.foodAvailable = v; }
    public void setPeopleCount(int v)      { this.peopleCount = v; }
    public void setTimestamp(String v)     { this.timestamp = v; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private final Ngo n = new Ngo();
        public Builder ngoName(String v)       { n.ngoName = v;       return this; }
        public Builder location(String v)      { n.location = v;      return this; }
        public Builder kumbhZone(String v)     { n.kumbhZone = v;     return this; }
        public Builder latitude(double v)      { n.latitude = v;      return this; }
        public Builder longitude(double v)     { n.longitude = v;     return this; }
        public Builder contact(String v)       { n.contact = v;       return this; }
        public Builder foodAvailable(int v)    { n.foodAvailable = v; return this; }
        public Builder peopleCount(int v)      { n.peopleCount = v;   return this; }
        public Builder timestamp(String v)     { n.timestamp = v;     return this; }
        public Ngo build() { return n; }
    }
}
