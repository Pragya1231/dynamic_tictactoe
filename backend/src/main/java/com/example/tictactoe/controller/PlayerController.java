package com.example.tictactoe.controller;

import com.example.tictactoe.entity.PlayerInfo;
import com.example.tictactoe.entity.User;
import com.example.tictactoe.repository.PlayerRepository;
import com.example.tictactoe.request.UpdateUserRequest;
import com.example.tictactoe.response.AllPlayerResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

// PlayerController.java
@RestController
@RequestMapping("/api/players")
@CrossOrigin(origins = {
    "http://localhost:3000",
    "https://playspheregame.vercel.app/"
})
public class PlayerController {

    @Autowired
    private PlayerRepository playerRepository;

    // Fetch leaderboard
    @GetMapping("/leaderboard")
    public List<PlayerInfo> getLeaderboard() {
        List<PlayerInfo> playerInfos = playerRepository.findAllByOrderByScoreDesc();
        return playerInfos;
    }

    @GetMapping("/{username}")
    public User getPlayerInfo(@PathVariable String username){
        Optional<User> player = playerRepository.findByUsername(username);
        if(player.isPresent()){
            return player.get();
        }else{
            return null;
        }
    }

    @PostMapping
    public void updatePlayerInfo(UpdateUserRequest updateUserRequest){

    }

    // PlayerController.java
    @GetMapping("/all/{username}")
    public AllPlayerResponse getAllPlayers(@PathVariable String username) {
        List<User> allPlayers = playerRepository.findAll();
        AllPlayerResponse allPlayerResponse = new AllPlayerResponse();
        allPlayerResponse.setAllPlayers(allPlayers);
        Optional<User> user = playerRepository.findByUsername(username);
        allPlayerResponse.setMyFriends(user.get().getFriends());
        return allPlayerResponse;
    }

    @PostMapping("/{username}/add-friend/{friendUsername}")
    public User addFriend(@PathVariable String username, @PathVariable String friendUsername) {
        User player = playerRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Player not found"));
        if (!player.getFriends().contains(friendUsername)) {
            player.getFriends().add(friendUsername);
            playerRepository.save(player);
        }
        return player;
    }

    @PostMapping("/{username}/remove-friend/{friendUsername}")
    public User removeFriend(@PathVariable String username, @PathVariable String friendUsername) {
        User player = playerRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Player not found"));
        if (!player.getFriends().contains(friendUsername)) {
            player.getFriends().remove(friendUsername);
            playerRepository.save(player);
        }
        return player;
    }


    // Update score after win
//    @PostMapping("/update-score")
//    public ResponseEntity<?> updateScore(@RequestParam String username) {
//        PlayerInfo player = playerRepository.findByUsername(username)
//                .orElseThrow(() -> new RuntimeException("Player not found"));
//
//        player.setScore(player.getScore() + 100);
//        playerRepository.save(player);
//
//        return ResponseEntity.ok(player);
//    }
}

