import React from 'react';
import './PlayerList.css';

const PlayerList = ({ players, currentTurn }) => {
  const storedUsername = localStorage.getItem('username');
  const otherPlayers = players.filter(p => p.username !== storedUsername);
  const myPlayer = players.find(p => p.username === storedUsername);

  return (
    <div className="playerlist-container">
      {/* Other players */}
      <div className="player-row center">
        {otherPlayers.map((player, idx) => (
          <div
            key={idx}
            className={`player-item ${player.username === currentTurn ? 'active-turn' : ''}`}
          >
            <span>{player.username}</span>
            {player.symbol && <span className="ml-2">{player.symbol}</span>}
          </div>
        ))}
      </div>

      {/* Board will go between this and my name */}

      {/* My player name */}
      {myPlayer && (
        <div className="player-row center my-player">
          <div
            className={`player-item ${myPlayer.username === currentTurn ? 'active-turn' : ''}`}
          >
            <span>{myPlayer.username}</span>
            {myPlayer.symbol && <span className="ml-2">{myPlayer.symbol}</span>}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerList;
