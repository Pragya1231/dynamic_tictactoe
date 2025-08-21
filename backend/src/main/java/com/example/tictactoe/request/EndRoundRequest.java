package com.example.tictactoe.request;

import lombok.Data;

@Data
public class EndRoundRequest {
    private String boardId;

    public String getBoardId() {
        return boardId;
    }

    public void setBoardId(String boardId) {
        this.boardId = boardId;
    }
}
