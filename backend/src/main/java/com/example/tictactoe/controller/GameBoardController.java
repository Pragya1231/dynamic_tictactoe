package com.example.tictactoe.controller;

import com.example.tictactoe.entity.GameBoard;
import com.example.tictactoe.entity.PlayerInfo;
import com.example.tictactoe.entity.User;
import com.example.tictactoe.repository.GameBoardRepository;
import com.example.tictactoe.repository.UserRepository;
import com.example.tictactoe.request.EndRoundRequest;
import com.example.tictactoe.request.MoveRequest;
import com.example.tictactoe.request.OfflineGameRequest;
import com.example.tictactoe.request.SymbolRequest;
import com.example.tictactoe.service.GameService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/game")
@CrossOrigin(origins = "http://localhost:3000") // allow React app to connect
public class GameBoardController {

    @Autowired
    private GameBoardRepository gameBoardRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    GameService gameService;

    @PostMapping("/create")
    public GameBoard createGameBoard(@RequestParam int players,@RequestParam String username,@RequestParam int totalRounds) {
        String boardId = UUID.randomUUID().toString().substring(0, 6); // e.g., "abc123"

        GameBoard newBoard = new GameBoard(boardId, players);
        PlayerInfo p = new PlayerInfo();
        p.setUsername(username);
        p.setGuest(false);
        newBoard.getPlayers().add(p);
        newBoard.setOffline(false);
        newBoard.setTotalRounds(totalRounds);
        gameBoardRepository.save(newBoard);

        return newBoard;
    }

    @GetMapping("/{boardId}")
    public GameBoard getGameByBoardId(@PathVariable String boardId) {
        return gameBoardRepository.findByBoardId(boardId)
                .orElseThrow(() -> new RuntimeException("Game not found"));
    }

    @PostMapping("/join")
    public GameBoard joinGame(@RequestBody Map<String, String> request) {
        String boardId = request.get("boardId");
        String username = request.get("username");

        GameBoard game = gameBoardRepository.findByBoardId(boardId)
                .orElseThrow(() -> new RuntimeException("Game not found"));

        if (!game.getPlayers().contains(username) && game.getPlayers().size() < game.getNumPlayers()) {
            PlayerInfo p = new PlayerInfo();
            p.setUsername(username);
            Optional<User> u = userRepository.findByUsername(username);
            if(u.isPresent()){
                p.setGuest(false);
            }else{
                p.setGuest(true);
            }
            game.getPlayers().add(p);

            // Start game if full
            if (game.getPlayers().size() == game.getNumPlayers()) {
                game.setStatus("active");
                game.setPopupMessage("Round 1 has started");
                List<String> symbols = new ArrayList<>(List.of("🔴", "🔵", "🟢", "🟡", "🟣", "🟠", "⚫", "⚪", "⭐", "💎"));
                Collections.shuffle(symbols); // Shuffle to randomize symbol assignment

                List<PlayerInfo> players = game.getPlayers();
                for (int i = 0; i < game.getNumPlayers(); i++) {
                    players.get(i).setSymbol(symbols.get(i));
                }
                Random rand = new Random();
                String randomPlayer = players.get(rand.nextInt(players.size())).getUsername();
                game.setCurrentTurn(randomPlayer);
            }

            gameBoardRepository.save(game);
        }

        return game;
    }

    @PostMapping("/choose-symbol")
    public ResponseEntity<?> chooseSymbol(@RequestBody SymbolRequest req) {
        gameService.assignSymbol(req.getBoardId(), req.getUsername(), req.getSymbol());
        return ResponseEntity.ok().build();
    }

    // GameController.java

    @PostMapping("/create-offline")
    public ResponseEntity<?> createOfflineGame(@RequestBody OfflineGameRequest request) {
        String boardId = gameService.createOfflineGame(request.getNumPlayers(), request.getPlayerNames(),request.getTotalRounds());
        return ResponseEntity.ok(Map.of("boardId", boardId));
    }

    // Make Move
    @PostMapping("/move")
    public ResponseEntity<?> makeMove(@RequestBody MoveRequest req) {

        gameService.makeMove(req.getBoardId(), req.getRow(), req.getCol(), req.getUsername());
        return ResponseEntity.ok().build();
    }

    // End Round
    @PostMapping("/end-round")
    public ResponseEntity<?> endRound(@RequestBody EndRoundRequest request) {
        GameBoard game = gameBoardRepository.findByBoardId(request.getBoardId())
                .orElseThrow(() -> new IllegalArgumentException("Game not found"));

        game.updateScores(); // Optional: if you're syncing scores again

        if (game.getCurrentRound() >= game.getTotalRounds()) {
            game.setStatus("completed");

            // ✅ Set final game winner here
            game.setWinner(determineFinalWinner(game));
        } else {
            game.nextRound(); // Clears board, increments round, resets flags
        }

        gameBoardRepository.save(game);
        return ResponseEntity.ok().build();
    }

    public PlayerInfo determineFinalWinner(GameBoard game) {
        return game.getPlayers().stream()
                .max(Comparator.comparingInt(PlayerInfo::getScore))
                .orElse(null);
    }





}

