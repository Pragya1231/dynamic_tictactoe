package com.example.tictactoe.request;


import lombok.Data;

@Data
public class SymbolRequest {
    private String boardId;
    private String username;
    private String symbol;
    // getters and setters
}
