package com.kumbhanna.redistribution.repository;
import com.kumbhanna.redistribution.model.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
public interface FeedbackRepository extends JpaRepository<Feedback, Integer> {}
