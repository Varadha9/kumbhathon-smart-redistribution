package com.kumbhanna.redistribution.model;

import jakarta.persistence.*;

@Entity
@Table(name = "feedbacks")
public class Feedback {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int    id;
    private String tokenId;
    private String foodCenter;
    private int    rating;        // 1–5 stars
    private String comment;
    private String foodQuality;   // "Excellent" | "Good" | "Average" | "Poor"
    private String waitTime;      // "< 5 min" | "5-10 min" | "> 10 min"
    private String timestamp;

    public Feedback() {}

    public int    getId()          { return id; }
    public String getTokenId()     { return tokenId; }
    public String getFoodCenter()  { return foodCenter; }
    public int    getRating()      { return rating; }
    public String getComment()     { return comment; }
    public String getFoodQuality() { return foodQuality; }
    public String getWaitTime()    { return waitTime; }
    public String getTimestamp()   { return timestamp; }

    public void setId(int v)           { this.id = v; }
    public void setTokenId(String v)   { this.tokenId = v; }
    public void setFoodCenter(String v){ this.foodCenter = v; }
    public void setRating(int v)       { this.rating = v; }
    public void setComment(String v)   { this.comment = v; }
    public void setFoodQuality(String v){ this.foodQuality = v; }
    public void setWaitTime(String v)  { this.waitTime = v; }
    public void setTimestamp(String v) { this.timestamp = v; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private final Feedback f = new Feedback();
        public Builder tokenId(String v)    { f.tokenId = v;     return this; }
        public Builder foodCenter(String v) { f.foodCenter = v;  return this; }
        public Builder rating(int v)        { f.rating = v;      return this; }
        public Builder comment(String v)    { f.comment = v;     return this; }
        public Builder foodQuality(String v){ f.foodQuality = v; return this; }
        public Builder waitTime(String v)   { f.waitTime = v;    return this; }
        public Builder timestamp(String v)  { f.timestamp = v;   return this; }
        public Feedback build() { return f; }
    }
}
