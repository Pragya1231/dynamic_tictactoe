import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import Register from './pages/Register';
import GamePage from './pages/GamePage';
import Leaderboard from "./pages/Leaderboard";
import Profile from './pages/Profile';
import MyFriends from "./pages/MyFriends";
import NotificationsPage from "./pages/NotificationsPage";
import './index.css';


const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Register />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/game" element={<GamePage />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/friends" element={<MyFriends />} />
      <Route path="/notifications" element={<NotificationsPage />}/>    
      </Routes>
  </Router>
);

export default App;
