package com.example.tictactoe.repository;

import com.example.tictactoe.entity.PlayerInfo;
import com.example.tictactoe.entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

// PlayerRepository.java
@Repository
public interface PlayerRepository extends MongoRepository<User, String> {
    Optional<User> findByUsername(String username);
    List<PlayerInfo> findAllByOrderByScoreDesc();
}

