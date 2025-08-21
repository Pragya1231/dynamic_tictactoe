package com.example.tictactoe.request;

import lombok.Data;

@Data
public class InviteRequest {
    private String sender;
    private String receiver;
    private String boardId;
}
