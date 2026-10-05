import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import API_URL from "../api";
import "./Auth.css";

const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!email || !username || !password) {
      return setError("All fields are required.");
    }

    try {
      const res = await axios.post(`${API_URL}/api/users/register`, {
        email,
        username,
        password,
      });

      if (res.data.success) {
        localStorage.setItem("username", res.data.username);
        navigate("/home");
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError("Registration failed. Try again.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Account</h2>

        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="text"
          placeholder="Choose a username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Choose a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="error">{error}</p>}

        <button onClick={handleRegister}>Register</button>

        <div className="auth-links">
          <Link to="/login">Already have an account? Login</Link>
          <span> | </span>
          <Link to="/guest">Login as Guest</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
