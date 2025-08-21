import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import NavBar from "../components/NavBar.jsx";

const Profile = () => {
    const username = localStorage.getItem("username");
  const navigate = useNavigate();
  const [player, setPlayer] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [editField, setEditField] = useState(null);
  const [formValues, setFormValues] = useState({ username: "", password: "" });

  useEffect(() => {
    // Fetch logged-in player info (assuming username stored in localStorage)
    const storedUsername = localStorage.getItem("username");
    if (!storedUsername) {
      setPlayer({ username: "Guest", score: 0 });
      return;
    }

    axios
      .get(`http://localhost:8080/api/players/${storedUsername}`)
      .then((res) => {
        setPlayer(res.data);
        setFormValues({
          username: res.data.username,
          password: res.data.password || "",
        });
      })
      .catch((err) => console.error("Error fetching profile:", err));
  }, []);

  const handleSave = async () => {
    try {
      const response = await axios.put(
        `http://localhost:8080/api/players/${player.username}`,
        formValues
      );
      setPlayer(response.data);
      setEditField(null);
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("username");
    navigate("/");
  };

  if (!player) return <p>Loading...</p>;

  return (
    <div>
        <NavBar username={username} />
            {/* <div
          style={{
            minHeight: "100vh",
            padding: "20px",
            backgroundColor: "#d1c687"
          }} */}
        {/* ></div> */}
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#559f55",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          padding: "30px",
          width: "400px",
          boxShadow: "0 6px 14px rgba(0,0,0,0.15)",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>👤 Profile</h2>

        {/* Username */}
        <div style={rowStyle}>
          <span style={labelStyle}>Username:</span>
          {editField === "username" ? (
            <input
              type="text"
              value={formValues.username}
              onChange={(e) =>
                setFormValues({ ...formValues, username: e.target.value })
              }
              style={inputStyle}
            />
          ) : (
            <span>{player.username}</span>
          )}
          <button
            style={editButton}
            onClick={() =>
              editField === "username" ? handleSave() : setEditField("username")
            }
          >
            {editField === "username" ? "💾" : "✏️"}
          </button>
        </div>

        {/* Password (not for Guest) */}
        {player.username !== "Guest" && (
          <div style={rowStyle}>
            <span style={labelStyle}>Password:</span>
            {editField === "password" ? (
              <input
                type={showPassword ? "text" : "password"}
                value={formValues.password}
                onChange={(e) =>
                  setFormValues({ ...formValues, password: e.target.value })
                }
                style={inputStyle}
              />
            ) : (
              <span>
                {showPassword ? formValues.password : "••••••••"}
              </span>
            )}
            <button
              style={iconButton}
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? "🙈" : "👁"}
            </button>
            <button
              style={editButton}
              onClick={() =>
                editField === "password"
                  ? handleSave()
                  : setEditField("password")
              }
            >
              {editField === "password" ? "💾" : "✏️"}
            </button>
          </div>
        )}

        {/* Score */}
        <div style={rowStyle}>
          <span style={labelStyle}>Score:</span>
          <span>{player.score || 0}</span>
        </div>

        {/* Logout */}
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: "#ff4d4d",
              border: "none",
              padding: "10px 20px",
              borderRadius: "6px",
              cursor: "pointer",
              color: "#fff",
              fontSize: "16px",
            }}
          >
            🚪 Logout
          </button>
        </div>
      </div>
    </div>
    </div>
  );
};

const rowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "15px",
};

const labelStyle = {
  fontWeight: "bold",
  marginRight: "10px",
};

const inputStyle = {
  padding: "5px",
  border: "1px solid #ccc",
  borderRadius: "4px",
  flex: 1,
};

const editButton = {
  marginLeft: "10px",
  background: "transparent",
  border: "none",
  cursor: "pointer",
  fontSize: "18px",
};

const iconButton = {
  marginLeft: "10px",
  background: "transparent",
  border: "none",
  cursor: "pointer",
  fontSize: "18px",
};

export default Profile;
