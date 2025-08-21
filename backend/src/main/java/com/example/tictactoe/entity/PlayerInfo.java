package com.example.tictactoe.entity;

import lombok.Data;

@Data
public class PlayerInfo {
    private String username;
    private boolean isGuest;
    private String symbol; // e.g. "X" or "O"
    private int score = 0;

    public void incrementScore() {
        this.score =  this.score + 10;
    }

}

