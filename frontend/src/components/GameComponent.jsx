import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import JoinPrompt from './JoinPrompt';
import './GameComponent.css';

const emojiSymbols = ['🔴', '🔵', '🟢', '🟡', '🟣', '🟠', '⚫', '⚪', '⭐', '💎'];

const SymbolSelector = ({ symbols, onSelect }) => (
  <div className="emoji-picker">
    <h3>Select your emoji</h3>
    <div className="emoji-grid">
      {symbols.map((emoji) => (
        <button key={emoji} onClick={() => onSelect(emoji)} className="emoji-button">
          {emoji}
        </button>
      ))}
    </div>
  </div>
);

const GameComponent = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const boardId = searchParams.get('board');
  const numPlayers = parseInt(searchParams.get('players'));
  const storedUsername = localStorage.getItem('username');

  const [gameData, setGameData] = useState(null);
  const [showJoinPrompt, setShowJoinPrompt] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showEmojiSelector, setShowEmojiSelector] = useState(false);
  const [showEndRoundModal, setShowEndRoundModal] = useState(false);
  const [winningCoordinates, setWinningCoordinates] = useState([]);
  const [popupMessage, setPopupMessage] = useState(null);

  const lastRoundRef = useRef(null);
  const popupShownRef = useRef(false);

  const gameLink = `${window.location.origin}/game?board=${boardId}&players=${numPlayers}`;

  const fetchGame = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/game/${boardId}`);
      const data = res.data;
      setGameData(data);
      setWinningCoordinates(data.winningCoordinates || []);

      if (lastRoundRef.current !== null && data.currentRound > lastRoundRef.current) {
        popupShownRef.current = false;
      }
      if (!popupShownRef.current && data.popupMessage) {
        setPopupMessage(data.popupMessage);
        setTimeout(() => setPopupMessage(null), 3000);
        popupShownRef.current = true;
      }
      lastRoundRef.current = data.currentRound;

      const alreadyJoined = data.players.some(
        (player) => player.username === storedUsername
      );

      const alreadySelectedSymbol = data.players.find(
        (p) => p.username === storedUsername
      )?.symbol;

      if (!data.offline && !alreadyJoined) {
        setShowJoinPrompt(true);
      } else if (
        !alreadySelectedSymbol &&
        data.players.length === data.numPlayers
      ) {
        setShowEmojiSelector(true);
      }
    } catch (err) {
      console.error('Error fetching game:', err);
    }
  };

  useEffect(() => {
    fetchGame();
  }, [boardId, storedUsername]);

  useEffect(() => {
    if (gameData?.deadlocked && !isBoardFull(gameData.board)) {
      setShowEndRoundModal(true);
    }
  }, [gameData?.deadlocked]);

  const isBoardFull = (board) =>
    board.every((row) => row.every((cell) => typeof cell === 'string' && cell.trim() !== ''));

  const isWinningCell = (row, col) =>
    winningCoordinates.some(line =>
      line.some(([r, c]) => r === row && c === col)
    );

  const getWinningLineDirection = (line) => {
    if (!line || line.length < 2) return null;
    const [[r1, c1], [r2, c2]] = line;
    if (r1 === r2) return 'horizontal';
    if (c1 === c2) return 'vertical';
    if (r2 - r1 === c2 - c1) return 'diagonal-down';
    if (r2 - r1 === -(c2 - c1)) return 'diagonal-up';
    return null;
  };

  const handleJoin = async () => {
    try {
      let username = storedUsername;

      if (!username) {
        username = `guest${Math.floor(Math.random() * 10000)}`;
        localStorage.setItem('username', username);
      }

      await axios.post(`http://localhost:8080/api/game/join`, {
        boardId,
        username,
      });

      setShowJoinPrompt(false);
      fetchGame();
    } catch (err) {
      console.error('Failed to join game:', err);
    }
  };

  const handleEndRound = async () => {
    try {
      await axios.post(`http://localhost:8080/api/game/${boardId}/end-round`);
      setShowEndRoundModal(false);
      fetchGame();
    } catch (err) {
      console.error('Failed to end round', err);
    }
  };

  const handleBack = () => {
    const username = localStorage.getItem('username');
    navigate(username ? '/home' : '/');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(gameLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleEmojiSelect = async (symbol) => {
    try {
      await axios.post('http://localhost:8080/api/game/choose-symbol', {
        boardId,
        username: storedUsername,
        symbol,
      });

      setShowEmojiSelector(false);
      fetchGame();
    } catch (err) {
      console.error('Failed to assign emoji:', err);
    }
  };

  const handleCellClick = async (row, col) => {
    if (!gameData || !storedUsername || gameData.deadlocked) return;

    const cellValue = gameData.board[row][col];
    const isFilled = typeof cellValue === 'string' && cellValue.trim() !== '';
    if (isFilled) return;

    try {
      await axios.post(`http://localhost:8080/api/game/move`, {
        boardId,
        row,
        col,
        username: gameData.currentTurn,
      });
      fetchGame();
    } catch (err) {
      console.error("Move failed:", err);
    }
  };

  if (!gameData) return null;

  const myPlayer = gameData.players.find(p => p.username === storedUsername);
  const otherPlayers = gameData.players.filter(p => p.username !== storedUsername);

  return (
    <div className="game-container">
      <h1>Game Board #{boardId}</h1>

      {popupMessage && <div className="popup-message">{popupMessage}</div>}

      {!gameData.offline && showJoinPrompt && (
        <JoinPrompt
          onJoin={handleJoin}
          onBack={handleBack}
          username={storedUsername}
        />
      )}

      {gameData.currentRound && (
        <p className="font-semibold text-lg">Round {gameData.currentRound} of {gameData.totalRounds}</p>
      )}

      {!gameData.offline && gameData.status === "waiting" && (
        <div className="link-row">
          <input type="text" value={gameLink} readOnly />
          <button onClick={handleCopy}>{copied ? 'Copied!' : 'Copy Link'}</button>
        </div>
      )}

      {/* Centered Other Players */}
        <div
          className="player-row"
          style={{
            justifyContent: 'center',
            display: 'flex',
            gap: '20px',
            marginBottom: '20px',
            marginTop: '20px',
            minHeight: '60px' // ✅ Keeps height even if empty
          }}
        >
          {/* Actual players */}
          {otherPlayers.map((player, idx) => (
            <div
              key={idx}
              className={`player-item ${player.username === gameData.currentTurn ? 'active-turn' : ''}`}
            >
              <span>{player.username}</span> {player.symbol && <span>{player.symbol}</span>}
              {player.score != null && <div>Score: {player.score}</div>}
            </div>
          ))}

          {/* Dynamic placeholders based on totalPlayers */}
          {Array.from({ length: Math.max(0, (gameData?.numPlayers || 1) - 1 - otherPlayers.length) })
          .map((_, idx) => (
            <div
              key={`placeholder-${idx}`}
              className="player-item placeholder"
              style={{ opacity: 0.7, position: "relative", minWidth: "80px", minHeight: "80px" }}
            >
              —
              <button
                className="invite-button"
                onClick={() => navigate(`/friends?inviteGame=${boardId}`)}
              >
                ➕
              </button>
            </div>
        ))}


        </div>



      {/* Game Board */}
      {Array.isArray(gameData.board) && gameData.board.length > 0 && (
        <div className="board-wrapper">
          <div
            className="board-grid"
            style={{
              gridTemplateColumns: `repeat(${gameData.boardSize}, 40px)`,
              justifyContent: 'center',
              margin: '0 auto'
            }}
          >
            {gameData.board.map((row, rowIdx) =>
              row.map((cell, colIdx) => {
                const isDark = (rowIdx + colIdx) % 2 === 1;
                const isFilled = typeof cell === 'string' ? cell.trim() !== '' : !!cell;
                const isCurrentPlayerTurn = storedUsername === gameData.currentTurn;
                const isWinCell = isWinningCell(rowIdx, colIdx);

                let winDirection = null;
                winningCoordinates.forEach(line => {
                  if (line.some(([r, c]) => r === rowIdx && c === colIdx)) {
                    winDirection = getWinningLineDirection(line);
                  }
                });

                return (
                  <div
                    key={`${rowIdx}-${colIdx}`}
                    className={`board-cell ${isDark ? 'dark' : 'light'} 
                      ${isFilled ? 'cursor-not-allowed' : 
                        (isCurrentPlayerTurn ? 'cursor-pointer' : 'cursor-default')} 
                      ${isWinCell ? `winning-cell ${winDirection}` : ''}`}
                    onClick={() => {
                      if (gameData?.status === "waiting") {
                        setPopupMessage("All players have not joined yet.");
                        setTimeout(() => setPopupMessage(null), 3000);
                        return;
                      }
                      if (gameData?.currentTurn !== storedUsername) {
                        return;
                      }
                      if (!isFilled) handleCellClick(rowIdx, colIdx);
                    }}
                  >
                    {isFilled ? cell : <span className="dot"></span>}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* My Player Below Board */}
      {myPlayer && (
        <div className= "player-item" style={{ marginTop: '20px' }}>
          <span>{myPlayer.username}</span> {myPlayer.symbol && <span>{myPlayer.symbol}</span>}
          {myPlayer.score != null && <div>Score: {myPlayer.score}</div>}
        </div>
      )}

      {gameData?.status === 'completed' && (
        <div className="game-over">
          <h2>🎉 Game Over!</h2>
          {gameData.winner ? (
            <p>🏆 Winner: <strong>{gameData.winner.username}</strong> with {gameData.winner.score} points!</p>
          ) : (
            <p>It's a draw!</p>
          )}
        </div>
      )}

      {showEndRoundModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>This round is completed!</h2>
            <p>Would you like to end this round?</p>
            <button className="bg-green-500 text-white px-4 py-2 rounded" onClick={handleEndRound}>End Round</button>
            <button className="ml-2 px-4 py-2 border rounded" onClick={() => setShowEndRoundModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameComponent;
