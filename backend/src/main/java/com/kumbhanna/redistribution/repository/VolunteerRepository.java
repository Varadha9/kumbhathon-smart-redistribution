package com.kumbhanna.redistribution.repository;
import com.kumbhanna.redistribution.model.VolunteerAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
public interface VolunteerRepository extends JpaRepository<VolunteerAssignment, Integer> {}
