// src/components/Leaderboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import NavBar from "../components/NavBar.jsx";

const Leaderboard = () => {
    const username = localStorage.getItem("username");
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/players/leaderboard");
      console.log("Leaderboard data:", response.data);
      setPlayers(response.data);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    }
  };

  return (
    <div>
        <NavBar username={username} />
        <div
      style={{
        minHeight: "100vh",
        padding: "20px",
        backgroundColor: "#d1c687"
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>🏆 Leaderboard</h1>

      <div
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          background: "#fff",
          borderRadius: "8px",
          boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" , backgroundColor: "#559f55",}}>
          <thead style={{ backgroundColor: "#333", color: "#fff" }}>
            <tr>
              <th style={thStyle}>Rank</th>
              <th style={thStyle}>Player</th>
              <th style={thStyle}>Score</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player, index) => (
              <tr key={index} style={{ textAlign: "center" }}>
                <td style={tdStyle}>{index + 1}</td>
                <td style={tdStyle}>{player.username}</td>
                <td style={tdStyle}>{player.score || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
};

const thStyle = {
  padding: "12px",
  fontWeight: "bold",
};

const tdStyle = {
  padding: "12px",
  borderBottom: "1px solid #ddd",
};

export default Leaderboard;
