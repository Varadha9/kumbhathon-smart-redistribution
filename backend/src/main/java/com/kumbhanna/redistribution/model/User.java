package com.kumbhanna.redistribution.model;

public class User {
    private String name;
    private String email;
    private String password;
    private String role;
    private String contact;

    public User() {}

    public String getName()     { return name; }
    public String getEmail()    { return email; }
    public String getPassword() { return password; }
    public String getRole()     { return role; }
    public String getContact()  { return contact; }

    public void setName(String v)     { this.name = v; }
    public void setEmail(String v)    { this.email = v; }
    public void setPassword(String v) { this.password = v; }
    public void setRole(String v)     { this.role = v; }
    public void setContact(String v)  { this.contact = v; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private final User u = new User();
        public Builder name(String v)     { u.name = v;     return this; }
        public Builder email(String v)    { u.email = v;    return this; }
        public Builder password(String v) { u.password = v; return this; }
        public Builder role(String v)     { u.role = v;     return this; }
        public Builder contact(String v)  { u.contact = v;  return this; }
        public User build() { return u; }
    }
}
