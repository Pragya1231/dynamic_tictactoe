package com.example.tictactoe.service;

import com.example.tictactoe.entity.GameBoard;
import com.example.tictactoe.entity.PlayerInfo;
import com.example.tictactoe.repository.GameBoardRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class GameService {

    @Autowired
    GameBoardRepository gameBoardRepository;

    // Assigns symbol (for online games only)
    public void assignSymbol(String boardId, String username, String symbol) {
        GameBoard game = gameBoardRepository.findByBoardId(boardId)
                .orElseThrow(() -> new IllegalArgumentException("Game not found"));

        if (game.isOffline()) {
            return; // Skip for offline games
        }

        // Ensure unique symbol
        boolean symbolTaken = game.getPlayers().stream()
                .anyMatch(player -> symbol.equals(player.getSymbol()));
        if (symbolTaken) {
            throw new IllegalArgumentException("Symbol already taken");
        }

        game.getPlayers().stream()
                .filter(player -> player.getUsername().equals(username))
                .findFirst()
                .ifPresentOrElse(
                        player -> player.setSymbol(symbol),
                        () -> { throw new IllegalArgumentException("Player not found"); }
                );

        gameBoardRepository.save(game);
    }

    // Create a new offline game with randomized symbol assignment
    public String createOfflineGame(int numPlayers, List<String> playerNames, int totalRounds) {
        GameBoard game = new GameBoard(UUID.randomUUID().toString(), numPlayers);
        game.setStatus("active");
        game.setTotalRounds(totalRounds);
        game.setOffline(true);
        game.setPopupMessage("Round 1 has started");
        List<String> symbols = new ArrayList<>(List.of("🔴", "🔵", "🟢", "🟡", "🟣", "🟠", "⚫", "⚪", "⭐", "💎"));
        Collections.shuffle(symbols); // Shuffle to randomize symbol assignment

        List<PlayerInfo> players = new ArrayList<>();
        for (int i = 0; i < numPlayers; i++) {
            PlayerInfo p = new PlayerInfo();
            p.setUsername(playerNames.get(i));
            p.setSymbol(symbols.get(i)); // Assign unique symbol
            players.add(p);
        }

        game.setPlayers(players);

        // Set random starting player
        Random rand = new Random();
        String randomPlayer = playerNames.get(rand.nextInt(playerNames.size()));
        game.setCurrentTurn(randomPlayer);

        game.initBoard(game.getBoardSize()); // Initialize game board
        gameBoardRepository.save(game);
        return game.getBoardId();
    }

    // Core move logic
    public void makeMove(String boardId, int row, int col, String username) {
        GameBoard game = gameBoardRepository.findByBoardId(boardId)
                .orElseThrow(() -> new IllegalArgumentException("Game not found"));

        if (!game.getCurrentTurn().equals(username)) {
            throw new IllegalStateException("Not this player's turn");
        }

        List<List<String>> board = game.getBoard();

        if (!board.get(row).get(col).isBlank()) {
            throw new IllegalStateException("Cell already filled");
        }

        // Find the player
        PlayerInfo player = game.getPlayers().stream()
                .filter(p -> p.getUsername().equals(username))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Player not found"));

        // Place symbol
        board.get(row).set(col, player.getSymbol());

        // Win check
        List<List<Integer>> winningCoordinates = game.checkWinner(player.getSymbol(),game.getWinningCoordinates());
        if (winningCoordinates != null && !winningCoordinates.isEmpty()) {
            player.incrementScore();
            game.setCurrentRoundWinner(player.getUsername());

            List<List<List<Integer>>> matrixCoords = game.getWinningCoordinates();
            matrixCoords.add(winningCoordinates);

            game.setWinningCoordinates(matrixCoords); // Save matrix version
            game.setDeadlocked(false);
            switchTurn(game, username);
            if(game.isBoardFull()){
                createNewGame(game);
            }else{
                game.setBoard(board);
            }
        }
        else if (game.isBoardFull()) {
            if(game.getCurrentRound()==game.getTotalRounds()){
                game.setStatus("completed");

                // ✅ Set final game winner here
                game.setWinner(determineFinalWinner(game));
            }else {
                createNewGame(game);
            }
        } else {
            switchTurn(game,username);
            game.setBoard(board);
        }

        gameBoardRepository.save(game);
    }

    public PlayerInfo determineFinalWinner(GameBoard game) {
        return game.getPlayers().stream()
                .max(Comparator.comparingInt(PlayerInfo::getScore))
                .orElse(null);
    }

    public void switchTurn(GameBoard game, String username){
        // Switch to next player with a symbol
        List<PlayerInfo> symbolPlayers = game.getPlayers().stream()
                .filter(p -> p.getSymbol() != null)
                .collect(Collectors.toList());

        int currentIdx = -1;
        for (int i = 0; i < symbolPlayers.size(); i++) {
            if (symbolPlayers.get(i).getUsername().equals(username)) {
                currentIdx = i;
                break;
            }
        }

        int nextIdx = (currentIdx + 1) % symbolPlayers.size();
        game.setCurrentTurn(symbolPlayers.get(nextIdx).getUsername());
    }
    private void createNewGame(GameBoard game){
        game.setDeadlocked(true);
        game.setCurrentRoundWinner(null); // No winner
        game.setWinningCoordinates(null);
        int updatedCurrentRound = game.getCurrentRound()+ 1;
        game.setCurrentRound(updatedCurrentRound);
        game.initBoard(game.getBoardSize());
        game.setPopupMessage("🎯 Round " + updatedCurrentRound + " has started!");
    }
}
