package com.kumbhanna.redistribution.repository;
import com.kumbhanna.redistribution.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
public interface UserRepository extends JpaRepository<User, String> {}
