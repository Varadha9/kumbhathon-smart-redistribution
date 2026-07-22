package com.kumbhanna.redistribution.model;

import jakarta.persistence.*;

@Entity
@Table(name = "transfers")
public class Transfer {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int    id;
    @Column(name = "from_ngo") private String from;
    @Column(name = "to_ngo")   private String to;
    private int    mealsToTransfer;
    private double distanceKm;
    private String urgency;
    private String status;
    private String timestamp;

    public Transfer() {}

    public int    getId()               { return id; }
    public String getFrom()             { return from; }
    public String getTo()               { return to; }
    public int    getMealsToTransfer()  { return mealsToTransfer; }
    public double getDistanceKm()       { return distanceKm; }
    public String getUrgency()          { return urgency; }
    public String getStatus()           { return status; }
    public String getTimestamp()        { return timestamp; }

    public void setId(int v)               { this.id = v; }
    public void setFrom(String v)          { this.from = v; }
    public void setTo(String v)            { this.to = v; }
    public void setMealsToTransfer(int v)  { this.mealsToTransfer = v; }
    public void setDistanceKm(double v)    { this.distanceKm = v; }
    public void setUrgency(String v)       { this.urgency = v; }
    public void setStatus(String v)        { this.status = v; }
    public void setTimestamp(String v)     { this.timestamp = v; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private final Transfer t = new Transfer();
        public Builder id(int v)               { t.id = v;               return this; }
        public Builder from(String v)          { t.from = v;             return this; }
        public Builder to(String v)            { t.to = v;               return this; }
        public Builder mealsToTransfer(int v)  { t.mealsToTransfer = v;  return this; }
        public Builder distanceKm(double v)    { t.distanceKm = v;       return this; }
        public Builder urgency(String v)       { t.urgency = v;          return this; }
        public Builder status(String v)        { t.status = v;           return this; }
        public Builder timestamp(String v)     { t.timestamp = v;        return this; }
        public Transfer build() { return t; }
    }
}
