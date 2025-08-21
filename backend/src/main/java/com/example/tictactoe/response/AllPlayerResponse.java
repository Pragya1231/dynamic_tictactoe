package com.example.tictactoe.response;

import com.example.tictactoe.entity.User;
import lombok.Data;

import java.util.List;
import java.util.Set;

@Data
public class AllPlayerResponse {
    private List<User> allPlayers;
    private List<String> myFriends;
}