package com.example.tictactoe.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection ="notification")
public class Notification {
    @Id
    private String id;

    private String sender;      // who sent the request
    private String receiver;    // who will receive notification
    private String message;
    private String status;      // PENDING, ACCEPTED, IGNORED
    private String type;
    private String gameId;   // only for GAME_INVITE
    private LocalDateTime createdAt = LocalDateTime.now();

    // getters/setters
}

