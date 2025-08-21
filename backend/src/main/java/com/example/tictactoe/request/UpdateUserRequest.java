package com.example.tictactoe.request;

import lombok.Data;

@Data
public class UpdateUserRequest {

    private String username;
    private String password;

}
