package com.kumbhanna.redistribution.service;

import com.kumbhanna.redistribution.model.*;
import com.kumbhanna.redistribution.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.util.*;

@Component
public class DataStore {

    @Autowired public NgoRepository          ngoRepo;
    @Autowired public UserRepository         userRepo;
    @Autowired public TransferRepository     transferRepo;
    @Autowired public DonationRepository     donationRepo;
    @Autowired public VolunteerRepository    volunteerRepo;
    @Autowired public VisitorTokenRepository visitorTokenRepo;
    @Autowired public FeedbackRepository     feedbackRepo;

    @Value("${admin.email}")    private String adminEmail;
    @Value("${admin.password}") private String adminPassword;
    @Value("${admin.name}")     private String adminName;

    public Map<String, Ngo>  ngos      = new NgoMap();
    public Map<String, User> users     = new UserMap();
    public List<Transfer>    transfers = new TransferList();
    public List<Donation>    donations = new DonationList();
    public List<VolunteerAssignment> volunteers = new VolunteerList();

    @PostConstruct
    public void seedAdmin() {
        if (!userRepo.existsById(adminEmail)) {
            BCryptPasswordEncoder enc = new BCryptPasswordEncoder();
            userRepo.save(User.builder()
                .name(adminName).email(adminEmail)
                .password(enc.encode(adminPassword))
                .role("admin").contact("").build());
        }
    }

    private class NgoMap extends AbstractMap<String, Ngo> {
        public Ngo get(Object key)             { return ngoRepo.findById((String) key).orElse(null); }
        public Ngo put(String key, Ngo value)  { return ngoRepo.save(value); }
        public boolean containsKey(Object key) { return ngoRepo.existsById((String) key); }
        public int size()                      { return (int) ngoRepo.count(); }
        public Collection<Ngo> values()        { return ngoRepo.findAll(); }
        public Set<Entry<String, Ngo>> entrySet() {
            Set<Entry<String, Ngo>> s = new LinkedHashSet<>();
            ngoRepo.findAll().forEach(n -> s.add(new SimpleEntry<>(n.getNgoName(), n)));
            return s;
        }
    }

    private class UserMap extends AbstractMap<String, User> {
        public User get(Object key)             { return userRepo.findById((String) key).orElse(null); }
        public User put(String key, User value) { return userRepo.save(value); }
        public boolean containsKey(Object key)  { return userRepo.existsById((String) key); }
        public int size()                       { return (int) userRepo.count(); }
        public Set<Entry<String, User>> entrySet() {
            Set<Entry<String, User>> s = new LinkedHashSet<>();
            userRepo.findAll().forEach(u -> s.add(new SimpleEntry<>(u.getEmail(), u)));
            return s;
        }
    }

    private class TransferList extends AbstractList<Transfer> {
        public Transfer get(int i) { return transferRepo.findAll().get(i); }
        public int size()          { return (int) transferRepo.count(); }
        public boolean add(Transfer t) { transferRepo.save(t); return true; }
        public java.util.stream.Stream<Transfer> stream() { return transferRepo.findAll().stream(); }
    }

    private class DonationList extends AbstractList<Donation> {
        public Donation get(int i) { return donationRepo.findAll().get(i); }
        public int size()          { return (int) donationRepo.count(); }
        public boolean add(Donation d) { donationRepo.save(d); return true; }
        public java.util.stream.Stream<Donation> stream() { return donationRepo.findAll().stream(); }
    }

    private class VolunteerList extends AbstractList<VolunteerAssignment> {
        public VolunteerAssignment get(int i)      { return volunteerRepo.findAll().get(i); }
        public int size()                          { return (int) volunteerRepo.count(); }
        public boolean add(VolunteerAssignment va) { volunteerRepo.save(va); return true; }
        public java.util.stream.Stream<VolunteerAssignment> stream() { return volunteerRepo.findAll().stream(); }
    }
}
