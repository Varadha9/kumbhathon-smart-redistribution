package com.kumbhanna.redistribution.service;

import com.kumbhanna.redistribution.model.*;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * In-memory data store for all application data.
 * Acts as the "database" for the demo.
 * Upgrade to JPA + H2/PostgreSQL for production persistence.
 */
@Component
public class DataStore {
    public final Map<String, Ngo>               ngos       = new ConcurrentHashMap<>();
    public final Map<String, User>              users      = new ConcurrentHashMap<>();
    public final List<Transfer>                 transfers  = new CopyOnWriteArrayList<>();
    public final List<Donation>                 donations  = new CopyOnWriteArrayList<>();
    public final List<VolunteerAssignment>      volunteers = new CopyOnWriteArrayList<>();
}
