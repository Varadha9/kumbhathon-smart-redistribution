package com.kumbhanna.redistribution.model;

public class Alert {
    private String  from;
    private String  to;
    private int     mealsToTransfer;
    private double  distanceKm;
    private String  urgency;
    private boolean sameZone;
    private String  demandReason;
    private String  fromZone;
    private String  toZone;

    public Alert() {}

    public String  getFrom()             { return from; }
    public String  getTo()               { return to; }
    public int     getMealsToTransfer()  { return mealsToTransfer; }
    public double  getDistanceKm()       { return distanceKm; }
    public String  getUrgency()          { return urgency; }
    public boolean isSameZone()          { return sameZone; }
    public String  getDemandReason()     { return demandReason; }
    public String  getFromZone()         { return fromZone; }
    public String  getToZone()           { return toZone; }

    public void setFrom(String v)            { this.from = v; }
    public void setTo(String v)              { this.to = v; }
    public void setMealsToTransfer(int v)    { this.mealsToTransfer = v; }
    public void setDistanceKm(double v)      { this.distanceKm = v; }
    public void setUrgency(String v)         { this.urgency = v; }
    public void setSameZone(boolean v)       { this.sameZone = v; }
    public void setDemandReason(String v)    { this.demandReason = v; }
    public void setFromZone(String v)        { this.fromZone = v; }
    public void setToZone(String v)          { this.toZone = v; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private final Alert a = new Alert();
        public Builder from(String v)            { a.from = v;             return this; }
        public Builder to(String v)              { a.to = v;               return this; }
        public Builder mealsToTransfer(int v)    { a.mealsToTransfer = v;  return this; }
        public Builder distanceKm(double v)      { a.distanceKm = v;       return this; }
        public Builder urgency(String v)         { a.urgency = v;          return this; }
        public Builder sameZone(boolean v)       { a.sameZone = v;         return this; }
        public Builder demandReason(String v)    { a.demandReason = v;     return this; }
        public Builder fromZone(String v)        { a.fromZone = v;         return this; }
        public Builder toZone(String v)          { a.toZone = v;           return this; }
        public Alert build() { return a; }
    }
}
