package com.example.tictactoe.request;

import lombok.Data;

@Data
public class MoveRequest {
    private String boardId;
    private int row;
    private int col;
    private String username;
    // getters and setters
}

