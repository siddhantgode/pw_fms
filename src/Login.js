// src/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, provider } from './firebase';

// Import Font Awesome components and icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faList, faExchangeAlt, faBook, faPlane } from '@fortawesome/free-solid-svg-icons';

const Login = ({ user, setUser }) => {
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      console.log('Attempting Google sign-in');
      const result = await signInWithPopup(auth, provider);
      console.log('Sign-in result:', result);
      setUser(result.user); // Update parent state
      setError(null);
      navigate('/welcome');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please try again.');
    }
  };

  const handleSignOut = async () => {
    try {
      console.log('Attempting sign-out');
      await signOut(auth);
      setUser(null); // Update parent state
      setError(null);
      console.log('Signed out successfully');
      navigate('/');
    } catch (err) {
      console.error('Sign-out error:', err);
      setError(err.message || 'Sign-out failed.');
    }
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  // Render different views based on user state
  return (
    <div className="App" style={{ backgroundColor: user ? '#ffffff' : '#ffffff' }}>
      <header className="App-header" style={{ color: '#000000', position: 'relative', minHeight: '100vh' }}>
        <h1 className="app-title">Pearl-Wellness</h1>
        {user ? (
          // Welcome view
          <div>
            <div style={{ position: 'absolute', top: '20px', left: '20px', right: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h1 style={{ fontSize: '1.5rem', margin: '0', color: '#000000' }}>Welcome to Team Pearl, {user.displayName || 'User'}!</h1>
              <button
                onClick={handleSignOut}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#f0f0f0',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#000000',
                  margin: '0',
                }}
              >
                Sign Out
              </button>
            </div>
            <div style={{ padding: '40px', display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '80px', flexWrap: 'wrap' }}>
              <div className="tile" onClick={() => handleNavigate('/transaction-register')}>
                <FontAwesomeIcon icon={faList} size="lg" style={{ marginBottom: '5px', color: '#007bff' }} />
                <span>Transaction Register</span>
              </div>
              <div className="tile" onClick={() => handleNavigate('/shift-handover')}>
                <FontAwesomeIcon icon={faExchangeAlt} size="lg" style={{ marginBottom: '5px', color: '#007bff' }} />
                <span>Shift Handover</span>
              </div>
              <div className="tile" onClick={() => handleNavigate('/log-book')}>
                <FontAwesomeIcon icon={faBook} size="lg" style={{ marginBottom: '5px', color: '#007bff' }} />
                <span>Log Book</span>
              </div>
              <div className="tile" onClick={() => handleNavigate('/travel-desk')}>
                <FontAwesomeIcon icon={faPlane} size="lg" style={{ marginBottom: '5px', color: '#007bff' }} />
                <span>Travel Desk</span>
              </div>
            </div>
          </div>
        ) : (
          // Login view
          <div>
            <button
              onClick={handleLogin}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 12px',
                backgroundColor: 'white',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '14px',
                gap: '8px',
                color: '#000000',
              }}
            >
              <img
                src="https://developers.google.com/identity/images/g-logo.png"
                alt="Google logo"
                style={{ width: '20px', height: '20px' }}
              />
              Sign in with Google
            </button>
          </div>
        )}
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </header>
    </div>
  );
};

export default Login;