package com.example.tictactoe.response;

import lombok.Data;

@Data
public class InviteResponse {
    private String notifId;
    private String action; // ACCEPT / IGNORE
}
