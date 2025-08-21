package com.example.tictactoe.request;

import jdk.jfr.DataAmount;
import lombok.Data;

import java.util.List;

@Data
public class OfflineGameRequest {
    private int numPlayers;
    private List<String> playerNames;
    private int totalRounds;
    // Getters and Setters
}

