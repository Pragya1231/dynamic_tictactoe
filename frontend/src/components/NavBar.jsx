// src/components/NavBar.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [pending, setPending] = useState([]);
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const settingsRef = useRef(null);
  const searchRef = useRef(null);

  const username = localStorage.getItem("username");

  const fetchUsersAndFriends = async () => {
    try {
      if (!username) return;
      const res = await axios.get(
        `http://localhost:8080/api/players/all/${username}`
      );
      setUsers(res.data.allPlayers || []);
      setFriends(res.data.myFriends || []);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const fetchPending = async () => {
    try {
      if (!username) return;
      const res = await axios.get(
        `http://localhost:8080/api/notifications/outgoing/${username}`
      );
      setPending((res.data || []).map((n) => n.receiver));
    } catch (err) {
      console.error("Error fetching outgoing requests:", err);
    }
  };

  useEffect(() => {
    fetchUsersAndFriends();
    fetchPending();
  }, [username]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("username");
    navigate("/login");
  };

  const handleSendRequest = async (friendUsername) => {
    try {
      await axios.post(
        `http://localhost:8080/api/notifications/send/${username}/${friendUsername}`
      );
      setPending((prev) => [...prev, friendUsername]);
    } catch (err) {
      console.error("Error sending request:", err);
    }
  };

  const handleRemoveFriend = async (friendUsername) => {
    try {
      await axios.post(
        `http://localhost:8080/api/players/${username}/remove-friend/${friendUsername}`
      );
      setFriends((prev) => prev.filter((f) => f !== friendUsername));
    } catch (err) {
      console.error("Error removing friend:", err);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) &&
      u.username !== username
  );

  const highlightMatch = (text, query) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, "gi");
    return text.split(regex).map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} style={{ background: "yellow" }}>
          {part}
        </mark>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  const getButtonStyle = (path) => ({
    background: location.pathname === path ? "#555" : "transparent",
    border: "none",
    color: "#fff",
    cursor: "pointer",
    fontSize: "16px",
    padding: "6px 12px",
    borderRadius: "4px",
    transition: "0.2s",
  });

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 20px",
        backgroundColor: "#333",
        color: "#fff",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      {/* Logo */}
      <div
        style={{ fontSize: "20px", fontWeight: "bold", cursor: "pointer" }}
        onClick={() => navigate("/")}
      >
        🕹 Tic-Tac-Game
      </div>

      {/* Navigation buttons */}
      <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
        <button style={getButtonStyle("/home")} onClick={() => navigate("/home")}>
          Home
        </button>
        <button
          style={getButtonStyle("/leaderboard")}
          onClick={() => navigate("/leaderboard")}
        >
          Leaderboard
        </button>
        {/* Notifications */}
        <button
          style={getButtonStyle("/notifications")}
          onClick={() => navigate("/notifications")}
        >
          🔔 Notifications
        </button>

        {/* Search bar for adding friends */}
        <div style={{ position: "relative" }} ref={searchRef}>
          <input
            type="text"
            placeholder="Add friends..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSearchOpen(true);
            }}
            style={{
              padding: "6px 10px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              fontSize: "14px",
              width: "200px",
            }}
          />
          {searchOpen && (
            <div
              style={{
                position: "absolute",
                top: "110%",
                left: 0,
                backgroundColor: "#fff",
                color: "#333",
                borderRadius: "6px",
                boxShadow: "0px 4px 8px rgba(0,0,0,0.15)",
                overflow: "hidden",
                minWidth: "260px",
                maxHeight: "320px",
                overflowY: "auto",
                zIndex: 3000,
                padding: "10px",
              }}
            >
              {filteredUsers.map((user) => {
                const isFriend = friends.includes(user.username);
                const isPending = pending.includes(user.username);

                return (
                  <div
                    key={user.username}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 0",
                      borderBottom: "1px solid #eee",
                      gap: "10px",
                    }}
                  >
                    <span>{highlightMatch(user.username, search)}</span>

                    {isFriend ? (
                      <button
                        onClick={() => handleRemoveFriend(user.username)}
                        style={pillBtn("remove")}
                      >
                        Remove
                      </button>
                    ) : isPending ? (
                      <button disabled style={pillBtn("pending")}>
                        Pending
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSendRequest(user.username)}
                        style={pillBtn("add")}
                      >
                        Add
                      </button>
                    )}
                  </div>
                );
              })}

              {filteredUsers.length === 0 && (
                <p
                  style={{
                    textAlign: "center",
                    fontSize: "14px",
                    padding: "8px",
                  }}
                >
                  No users found
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Settings Dropdown */}
      <div style={{ position: "relative" }} ref={settingsRef}>
        <button
          onClick={() => setOpen((p) => !p)}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "#fff",
            fontSize: "18px",
          }}
        >
          ⚙️ Settings
        </button>

        {open && (
          <div
            style={{
              position: "absolute",
              right: 0,
              marginTop: "8px",
              backgroundColor: "#fff",
              color: "#333",
              borderRadius: "6px",
              boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
              overflow: "hidden",
              minWidth: "180px",
              zIndex: 2000,
            }}
          >
            <DropdownItem onClick={() => navigate("/profile")}>
              👤 Profile ({username || "Guest"})
            </DropdownItem>
            <DropdownItem onClick={() => navigate("/leaderboard")}>
              🏆 Leaderboard
            </DropdownItem>
            <DropdownItem onClick={() => navigate("/friends")}>
              👥 My Friends
            </DropdownItem>
            <DropdownItem danger onClick={handleLogout}>
              🚪 Logout
            </DropdownItem>
          </div>
        )}
      </div>
    </nav>
  );
};

/* ---------------- Reusable Dropdown Item ---------------- */
const DropdownItem = ({ children, onClick, danger }) => {
  const [hover, setHover] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: "10px 15px",
        cursor: "pointer",
        borderBottom: "1px solid #eee",
        backgroundColor: hover ? "#f0f0f0" : "white",
        fontWeight: hover ? "500" : "400",
        color: danger ? "red" : "inherit",
        transition: "all 0.2s ease",
      }}
    >
      {children}
    </div>
  );
};

/* ---------------- Button styles for Add/Remove/Pending ---------------- */
const pillBtn = (type) => {
  const base = {
    border: "none",
    padding: "6px 10px",
    borderRadius: "999px",
    cursor: "pointer",
    fontSize: "13px",
    minWidth: "74px",
  };
  if (type === "add") return { ...base, background: "#559f55", color: "#fff" };
  if (type === "remove")
    return { ...base, background: "#d9534f", color: "#fff" };
  if (type === "pending")
    return {
      ...base,
      background: "#e0a800",
      color: "#fff",
      opacity: 0.9,
      cursor: "not-allowed",
    };
  return base;
};

export default NavBar;
