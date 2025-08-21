import React, { useEffect, useState } from "react";
import axios from "axios";
import NavBar from "../components/NavBar";

const NotificationsPage = () => {
  const username = localStorage.getItem("username");
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (username) {
      axios
        .get(`http://localhost:8080/api/notifications/${username}`)
        .then((res) => setNotifications(res.data))
        .catch((err) => console.error("Error fetching notifications:", err));
    }
  }, [username]);

  const handleAction = async (id, action) => {
    try {
      await axios.post(
        `http://localhost:8080/api/notifications/${id}/${action}`
      );
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, status: action.toUpperCase() } : n
        )
      );
    } catch (err) {
      console.error("Error updating notification:", err);
    }
  };

  const renderMessage = (n) => {
    if (n.type === "FRIEND_REQUEST") {
      return `${n.sender} wants to add you as a friend`;
    }
    if (n.type === "GAME_INVITE") {
      return `${n.sender} invited you to join game ${n.gameId}`;
    }
    return "New notification";
  };

  const getStatus = (n) => {
    if (n.status) return n.status; // already overridden locally
    if (n.accepted) return "ACCEPTED";
    if (n.ignored) return "IGNORED";
    return "PENDING";
  };

  return (
    <div>
      <NavBar username={username} />
      <div style={{ padding: "20px" }}>
        <h2>🔔 Notifications</h2>
        {notifications.length > 0 ? (
          notifications.map((n) => {
            const status = getStatus(n);
            return (
              <div
                key={n.id}
                style={{
                  padding: "10px",
                  borderBottom: "1px solid #ddd",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>{renderMessage(n)}</span>
                {status === "PENDING" ? (
                  <div>
                    <button
                      style={{
                        background: "green",
                        color: "#fff",
                        padding: "5px 10px",
                        marginRight: "10px",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                      onClick={() => handleAction(n.id, "accept")}
                    >
                      Accept
                    </button>
                    <button
                      style={{
                        background: "red",
                        color: "#fff",
                        padding: "5px 10px",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                      onClick={() => handleAction(n.id, "ignore")}
                    >
                      Ignore
                    </button>
                  </div>
                ) : (
                  <span style={{ fontStyle: "italic", color: "gray" }}>
                    {status}
                  </span>
                )}
              </div>
            );
          })
        ) : (
          <p>No notifications yet.</p>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
