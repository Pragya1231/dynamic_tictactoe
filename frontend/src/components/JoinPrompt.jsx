// src/components/JoinPrompt.jsx
import React from 'react';

const JoinPrompt = ({ onJoin, onBack, username }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-md text-center w-96">
        <h2 className="text-xl font-semibold mb-4">Join Game</h2>
        <p className="mb-4">
          {username
            ? `You are logged in as "${username}". Do you want to join the game?`
            : `You are not logged in. You'll join as a guest.`}
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onJoin}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Join
          </button>
          <button
            onClick={onBack}
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinPrompt;
