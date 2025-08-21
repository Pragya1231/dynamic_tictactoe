package com.example.tictactoe.repository;

import com.example.tictactoe.entity.GameBoard;
import com.example.tictactoe.entity.PlayerInfo;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface GameBoardRepository extends MongoRepository<GameBoard, String> {
    Optional<GameBoard> findByBoardId(String boardId);

}

