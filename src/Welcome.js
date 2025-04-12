// src/Welcome.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { handleSignOut } from './Login';

const Welcome = ({ user, setUser }) => {
  const navigate = useNavigate();

  // Fallback if no user is passed
  const displayName = user?.displayName || 'User';

  const onSignOut = async () => {
    try {
      console.log('setUser in Welcome:', setUser); // Debug log
      await handleSignOut(setUser, navigate); // Call the sign-out function
    } catch (err) {
      console.error('Sign-out error:', err);
    }
  };

  return (
    <div className="Welcome">
      <header className="App-header">
        <h1>Welcome to Team Pearl, {displayName}!</h1>
        <button
          onClick={onSignOut}
          style={{
            padding: '8px 16px',
            backgroundColor: '#f0f0f0',
            border: '1px solid #ddd',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Sign Out
        </button>
      </header>
    </div>
  );
};

export default Welcome;