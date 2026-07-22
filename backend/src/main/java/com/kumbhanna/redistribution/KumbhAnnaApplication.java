package com.kumbhanna.redistribution;

import com.kumbhanna.redistribution.service.DataStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class KumbhAnnaApplication implements CommandLineRunner {

    @Autowired private DataStore store;

    public static void main(String[] args) {
        SpringApplication.run(KumbhAnnaApplication.class, args);
    }

    @Override
    public void run(String... args) {
        // Only seed demo data if the database is completely empty
        // This prevents overwriting real data on every restart
        if (store.ngos.size() == 0) {
            System.out.println("✅ KumbhAnna: Empty database detected — use Dashboard to load demo data");
        } else {
            System.out.println("✅ KumbhAnna: Database has " + store.ngos.size() + " NGOs — skipping seed");
        }
    }
}
