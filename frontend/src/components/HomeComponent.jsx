import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import NavBar from "./NavBar";

const HomeComponent = () => {
  const [mode, setMode] = useState(null);
  const [step, setStep] = useState(1);
  const [numPlayers, setNumPlayers] = useState("");
  const [playerNames, setPlayerNames] = useState([]);
  const [totalRounds, setTotalRounds] = useState("");
  const navigate = useNavigate();
  const username = localStorage.getItem("username");

  const handleModeSelect = (selectedMode) => {
    setMode(selectedMode);
    setStep(2);
  };

  const handleNumPlayersContinue = () => {
    const count = parseInt(numPlayers);
    const rounds = parseInt(totalRounds);

    if (!count || count < 1) return alert("Enter a valid number of players");
    if (!rounds || rounds < 1) return alert("Enter a valid number of rounds");

    if (mode === "offline") {
      setPlayerNames(
        Array.from({ length: count }, (_, i) => `Player ${i + 1}`)
      );
      setStep(3);
    } else {
      handleCreateGameOnline();
    }
  };

  const handleCreateGameOnline = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8080/api/game/create",
        null,
        {
          params: { players: numPlayers, username, totalRounds },
        }
      );
      const boardId = response.data.boardId;
      navigate(`/game?board=${boardId}&players=${numPlayers}&mode=online`);
    } catch (error) {
      console.error("Failed to create game:", error);
    }
  };

  const handleCreateGameOffline = async () => {
    try {
      const response = await axios.post(
        "http://localhost:8080/api/game/create-offline",
        {
          numPlayers,
          playerNames,
          totalRounds,
        }
      );
      const boardId = response.data.boardId;
      navigate(`/game?board=${boardId}&players=${numPlayers}&mode=offline`);
    } catch (error) {
      console.error("Failed to create game:", error);
    }
  };

  const handleNameChange = (index, newName) => {
    const updatedNames = [...playerNames];
    updatedNames[index] = newName;
    setPlayerNames(updatedNames);
  };

  return (
    <div style={{ minHeight: "100vh", overflow: "hidden", position: "relative" }}>
      {/* ✅ NavBar at the top */}
      <NavBar username={username} />

      {/* Background image */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          height: "100%",
          width: "100%",
          backgroundImage: `url('https://upload.wikimedia.org/wikipedia/commons/3/32/Tic_tac_toe.svg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          filter: "blur(8px) brightness(90%)",
          opacity: 0.2,
          zIndex: 0,
        }}
      ></div>

      {/* Foreground content */}
      <div
        className="bg-white p-8 rounded-xl shadow-md w-[500px]"
        style={{
          textAlign: "center",
          margin: "0 auto",
          marginTop: "235px",
          position: "relative",
          zIndex: 2,
        }}
      >
        <h1 className="text-xl font-semibold mb-4">
          Welcome, {username || "Guest"}
        </h1>

        {/* Step 1 */}
        {step === 1 && (
          <div
            className="flex gap-4 mb-4"
            style={{ marginTop: "50px" }}
          >
            <button
              className="py-2 px-4 text-white rounded hover:opacity-90"
              style={{
                marginRight: "40px",
                fontSize: "20px",
                backgroundColor: "#559f55",
                borderRadius: "8px",
                cursor: "pointer",
              }}
              onClick={() => handleModeSelect("online")}
            >
              Play Online
            </button>
            <button
              className="py-2 px-4 text-white rounded hover:opacity-90"
              style={{
                fontSize: "20px",
                backgroundColor: "#559f55",
                borderRadius: "8px",
                cursor: "pointer",
              }}
              onClick={() => handleModeSelect("offline")}
            >
              Play Offline
            </button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <>
            <input
              type="number"
              style={{ fontSize: "20px", borderRadius: "8px" }}
              min="1"
              placeholder="Enter number of players"
              value={numPlayers}
              onChange={(e) => setNumPlayers(e.target.value)}
              className="w-full p-2 border rounded mb-4"
            />
            <input
              type="number"
              min="1"
              style={{ fontSize: "20px", borderRadius: "8px" }}
              placeholder="Enter number of rounds"
              value={totalRounds}
              onChange={(e) => setTotalRounds(e.target.value)}
              className="w-full p-2 border rounded mb-4"
            />
            <button
              style={{
                fontSize: "20px",
                backgroundColor: "#559f55",
                borderRadius: "8px",
                cursor: "pointer",
              }}
              onClick={handleNumPlayersContinue}
              className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 cursor-pointer"
            >
              {mode === "offline" ? "Next" : "Start Game"}
            </button>
          </>
        )}

        {/* Step 3 */}
        {step === 3 && mode === "offline" && (
          <>
            <h3 className="font-semibold mb-2">Enter Player Names:</h3>
            {playerNames.map((name, idx) => (
              <input
                key={idx}
                value={name}
                onChange={(e) => handleNameChange(idx, e.target.value)}
                className="w-full p-2 border rounded mb-2"
              />
            ))}
            <button
              onClick={handleCreateGameOffline}
              className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 cursor-pointer mt-2"
            >
              Start Game
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default HomeComponent;
