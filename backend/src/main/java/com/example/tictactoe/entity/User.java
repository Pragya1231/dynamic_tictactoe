package com.example.tictactoe.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Data
@Document(collection = "users")
public class User {
    @Id
    private String id;

    private String username;
    private String password;
    private boolean isGuest;
    private String email;
    private int score = 0;
    private List<String> friends = new ArrayList<>();

    public User() {}

    public User(String username, String password, boolean isGuest) {
        this.username = username;
        this.password = password;
        this.isGuest = isGuest;
    }


}

