// src/pages/MyFriends.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../api";
import NavBar from "../components/NavBar.jsx";
import { useSearchParams } from "react-router-dom";

const MyFriends = () => {
  const username = localStorage.getItem("username");
  const [friends, setFriends] = useState([]);
  const [invitedFriends, setInvitedFriends] = useState({}); // ✅ track invited friends
  const [searchParams] = useSearchParams();

  const inviteGameId = searchParams.get("inviteGame");

  useEffect(() => {
    if (username) {
      axios
        .get(`${API_URL}/api/players/all/${username}`)
        .then((res) => setFriends(res.data.myFriends || []))
        .catch((err) => console.error("Error fetching friends:", err));
    }
  }, [username]);

  const handleRemoveFriend = async (friendUsername) => {
    try {
      await axios.post(
        `${API_URL}/api/players/${username}/remove-friend/${friendUsername}`
      );
      setFriends((prev) => prev.filter((f) => f !== friendUsername));
    } catch (err) {
      console.error("Error removing friend:", err);
    }
  };

  const handleInviteFriend = async (friendUsername) => {
    try {
      await axios.post(`${API_URL}/api/notifications/invite`, {
        sender: username,
        receiver: friendUsername,
        boardId: inviteGameId,
      });

      // ✅ update invited state
      setInvitedFriends((prev) => ({
        ...prev,
        [inviteGameId]: [...(prev[inviteGameId] || []), friendUsername],
      }));
    } catch (err) {
      console.error("Error inviting friend:", err);
      alert("❌ Failed to send invite");
    }
  };

  const isInvited = (friendUsername) =>
    invitedFriends[inviteGameId]?.includes(friendUsername);

  return (
    <div>
      <NavBar username={username} />

      <div style={{ padding: "20px" }}>
        <h2>👥 My Friends</h2>
        {friends.length > 0 ? (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {friends.map((friend, i) => (
              <li
                key={i}
                style={{
                  padding: "10px",
                  borderBottom: "1px solid #ddd",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>{friend}</span>
                {inviteGameId ? (
                  isInvited(friend) ? (
                    <span
                      style={{
                        color: "gray",
                        fontStyle: "italic",
                      }}
                    >
                      Invited
                    </span>
                  ) : (
                    <button
                      style={{
                        background: "#4caf50",
                        border: "none",
                        color: "#fff",
                        padding: "5px 10px",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                      onClick={() => handleInviteFriend(friend)}
                    >
                      Invite
                    </button>
                  )
                ) : (
                  <button
                    style={{
                      background: "#d9534f",
                      border: "none",
                      color: "#fff",
                      padding: "5px 10px",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                    onClick={() => handleRemoveFriend(friend)}
                  >
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p>You have no friends yet. Add some from the Friends tab 👥</p>
        )}
      </div>
    </div>
  );
};

export default MyFriends;
