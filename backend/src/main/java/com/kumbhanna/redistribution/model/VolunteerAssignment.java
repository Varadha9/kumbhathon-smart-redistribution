package com.kumbhanna.redistribution.model;

import jakarta.persistence.*;

@Entity
@Table(name = "volunteer_assignments")
public class VolunteerAssignment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int    id;
    private String volunteerName;
    private String volunteerPhone;
    private String fromNgo;
    private String toNgo;
    private int    meals;
    private String status;
    private String timestamp;
    private String deliveredAt;

    public VolunteerAssignment() {}

    public int    getId()             { return id; }
    public String getVolunteerName()  { return volunteerName; }
    public String getVolunteerPhone() { return volunteerPhone; }
    public String getFromNgo()        { return fromNgo; }
    public String getToNgo()          { return toNgo; }
    public int    getMeals()          { return meals; }
    public String getStatus()         { return status; }
    public String getTimestamp()      { return timestamp; }
    public String getDeliveredAt()    { return deliveredAt; }

    public void setId(int v)                { this.id = v; }
    public void setVolunteerName(String v)  { this.volunteerName = v; }
    public void setVolunteerPhone(String v) { this.volunteerPhone = v; }
    public void setFromNgo(String v)        { this.fromNgo = v; }
    public void setToNgo(String v)          { this.toNgo = v; }
    public void setMeals(int v)             { this.meals = v; }
    public void setStatus(String v)         { this.status = v; }
    public void setTimestamp(String v)      { this.timestamp = v; }
    public void setDeliveredAt(String v)    { this.deliveredAt = v; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private final VolunteerAssignment va = new VolunteerAssignment();
        public Builder id(int v)                { va.id = v;             return this; }
        public Builder volunteerName(String v)  { va.volunteerName = v;  return this; }
        public Builder volunteerPhone(String v) { va.volunteerPhone = v; return this; }
        public Builder fromNgo(String v)        { va.fromNgo = v;        return this; }
        public Builder toNgo(String v)          { va.toNgo = v;          return this; }
        public Builder meals(int v)             { va.meals = v;          return this; }
        public Builder status(String v)         { va.status = v;         return this; }
        public Builder timestamp(String v)      { va.timestamp = v;      return this; }
        public Builder deliveredAt(String v)    { va.deliveredAt = v;    return this; }
        public VolunteerAssignment build() { return va; }
    }
}
