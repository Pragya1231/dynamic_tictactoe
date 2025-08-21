import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Auth.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      return setError("Email and password required.");
    }

    try {
      const res = await axios.post("http://localhost:8080/api/users/login", {
        email,
        password,
      });
      console.log(res.data);

      if (res.data.success) {
        localStorage.setItem("username", res.data.username);
        navigate("/home");
      } else {
        setError(res.data.message || "Login failed");
      }
    } catch (err) {
      setError("Invalid credentials or server error");
    }
  };

  const handleGuestLogin = async () => {
    try {
      const res = await axios.post("http://localhost:8080/api/users/guest");
      if (res.data.success) {
        localStorage.setItem("username", res.data.username);
        navigate("/home");
      }
    } catch (err) {
      setError("Could not login as guest.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Welcome Back</h2>

        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="error">{error}</p>}

        <button onClick={handleLogin}>Login</button>
        <button className="guest-btn" onClick={handleGuestLogin}>
          Continue as Guest
        </button>

        <div className="auth-links">
          <Link to="/register">Don't have an account? Register</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
