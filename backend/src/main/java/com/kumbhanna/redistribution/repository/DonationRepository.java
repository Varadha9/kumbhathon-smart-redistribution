package com.kumbhanna.redistribution.repository;
import com.kumbhanna.redistribution.model.Donation;
import org.springframework.data.jpa.repository.JpaRepository;
public interface DonationRepository extends JpaRepository<Donation, Integer> {}
