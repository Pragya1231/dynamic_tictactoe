package com.example.tictactoe.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.*;

@Data
@Document(collection = "gameBoards")
public class GameBoard {
    @Id
    private String id;

    private String boardId;
    private int numPlayers;
    private String status;
    private List<PlayerInfo> players = new ArrayList<>();
    private PlayerInfo winner;
    private List<List<String>> board;

    private int winLength;
    private int boardSize;
    private String currentTurn;
    private boolean isOffline;
    private boolean deadlocked;
    private String currentRoundWinner;
    private int currentRound = 1;
    private int totalRounds;
    private Map<String, Integer> scores = new HashMap<>();
    private List<List<List<Integer>>> winningCoordinates = new ArrayList<>();
    private String popupMessage;
    private List<int[]> lastWinningCoords;


    public GameBoard(String boardId, int numPlayers) {
        this.boardId = boardId;
        this.numPlayers = numPlayers;
        this.status = "waiting";
        int size = calculateBoardSize(numPlayers);
        this.boardSize = size;
        this.winLength = calculateWinningCount(size);
        initBoard(size);
    }

    public int calculateBoardSize(int numPlayers) {
        if (numPlayers == 2) return 3;
        if (numPlayers == 3) return 5;
        if (numPlayers <= 5) return 8;
        return 10;
    }

    public int calculateWinningCount(int boardSize) {
        if (numPlayers == 2) return 3;
        if (numPlayers == 3) return 4;
        return 5;
    }

    public void initBoard(int size) {
        this.board = new ArrayList<>();
        for (int i = 0; i < size; i++) {
            List<String> row = new ArrayList<>();
            for (int j = 0; j < size; j++) row.add("");
            board.add(row);
        }
    }

    public void updateScores() {
        Map<String, Integer> newScores = new HashMap<>();
        for (PlayerInfo player : players) {
            String symbol = player.getSymbol();
            if (symbol == null) continue;
            int count = countWinningSequences(symbol, winLength);
            newScores.put(player.getUsername(), count * 10);
        }
        this.scores = newScores;
    }

    public boolean isDeadlocked() {
        for (List<String> row : board) {
            for (String cell : row) {
                if (cell == null || cell.isBlank()) return false;
            }
        }
        return true;
    }

    public int countWinningSequences(String symbol, int winLength) {
        int count = 0;
        int n = board.size();

        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                // Horizontal
                if (j + winLength <= n) {
                    boolean match = true;
                    for (int k = 0; k < winLength; k++) {
                        if (!symbol.equals(board.get(i).get(j + k))) {
                            match = false;
                            break;
                        }
                    }
                    if (match) count++;
                }

                // Vertical
                if (i + winLength <= n) {
                    boolean match = true;
                    for (int k = 0; k < winLength; k++) {
                        if (!symbol.equals(board.get(i + k).get(j))) {
                            match = false;
                            break;
                        }
                    }
                    if (match) count++;
                }

                // Diagonal ↘
                if (i + winLength <= n && j + winLength <= n) {
                    boolean match = true;
                    for (int k = 0; k < winLength; k++) {
                        if (!symbol.equals(board.get(i + k).get(j + k))) {
                            match = false;
                            break;
                        }
                    }
                    if (match) count++;
                }

                // Diagonal ↙
                if (i + winLength <= n && j - winLength + 1 >= 0) {
                    boolean match = true;
                    for (int k = 0; k < winLength; k++) {
                        if (!symbol.equals(board.get(i + k).get(j - k))) {
                            match = false;
                            break;
                        }
                    }
                    if (match) count++;
                }
            }
        }

        return count;
    }

    public void nextRound() {
        this.currentRound += 1;
        this.board = new ArrayList<>();
        for (int i = 0; i < boardSize; i++) {
            List<String> row = new ArrayList<>();
            for (int j = 0; j < boardSize; j++) row.add("");
            board.add(row);
        }

        List<PlayerInfo> playersWithSymbols = players.stream()
                .filter(p -> p.getSymbol() != null)
                .toList();

        if (!playersWithSymbols.isEmpty()) {
            Collections.shuffle(playersWithSymbols);
            this.setCurrentTurn(playersWithSymbols.get(0).getSymbol());
        }
    }

    public boolean isBoardFull() {
        for (List<String> row : board) {
            for (String cell : row) {
                if (cell == null || cell.isBlank()) return false;
            }
        }
        return true;
    }

    public List<List<Integer>> checkWinner(
            String symbol,
            List<List<List<Integer>>> existingWinningCoordinates
    ) {
        int size = boardSize;
        int winLength = this.getWinLength();
        List<List<Integer>> winningCoords = new ArrayList<>();

        // Helper to check if any coordinate is already used
        java.util.function.Predicate<List<List<Integer>>> hasNoOverlap = coords ->
                existingWinningCoordinates == null ||
                        existingWinningCoordinates.stream()
                                .flatMap(List::stream) // flatten to individual coordinates
                                .noneMatch(coords::contains); // no coordinate in common

        // Horizontal
        for (int i = 0; i < size; i++) {
            for (int j = 0; j <= size - winLength; j++) {
                winningCoords.clear();
                boolean win = true;
                for (int k = 0; k < winLength; k++) {
                    if (!symbol.equals(board.get(i).get(j + k))) {
                        win = false;
                        break;
                    }
                    winningCoords.add(Arrays.asList(i, j + k));
                }
                if (win && hasNoOverlap.test(winningCoords)) {
                    return new ArrayList<>(winningCoords);
                }
            }
        }

        // Vertical
        for (int i = 0; i <= size - winLength; i++) {
            for (int j = 0; j < size; j++) {
                winningCoords.clear();
                boolean win = true;
                for (int k = 0; k < winLength; k++) {
                    if (!symbol.equals(board.get(i + k).get(j))) {
                        win = false;
                        break;
                    }
                    winningCoords.add(Arrays.asList(i + k, j));
                }
                if (win && hasNoOverlap.test(winningCoords)) {
                    return new ArrayList<>(winningCoords);
                }
            }
        }

        // Diagonal (\)
        for (int i = 0; i <= size - winLength; i++) {
            for (int j = 0; j <= size - winLength; j++) {
                winningCoords.clear();
                boolean win = true;
                for (int k = 0; k < winLength; k++) {
                    if (!symbol.equals(board.get(i + k).get(j + k))) {
                        win = false;
                        break;
                    }
                    winningCoords.add(Arrays.asList(i + k, j + k));
                }
                if (win && hasNoOverlap.test(winningCoords)) {
                    return new ArrayList<>(winningCoords);
                }
            }
        }

        // Anti-diagonal (/)
        for (int i = 0; i <= size - winLength; i++) {
            for (int j = winLength - 1; j < size; j++) {
                winningCoords.clear();
                boolean win = true;
                for (int k = 0; k < winLength; k++) {
                    if (!symbol.equals(board.get(i + k).get(j - k))) {
                        win = false;
                        break;
                    }
                    winningCoords.add(Arrays.asList(i + k, j - k));
                }
                if (win && hasNoOverlap.test(winningCoords)) {
                    return new ArrayList<>(winningCoords);
                }
            }
        }

        return null;
    }










    public List<int[]> getLastWinningCoords() {
        return lastWinningCoords;
    }



}
