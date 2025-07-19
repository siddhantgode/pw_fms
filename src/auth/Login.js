import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import tileOptions from '../components/tiles/tileOptions';
import './Login.css';

const sections = [
  'Front Office',
  'Housekeeping',
  'F&B',
  'Stores',
  'Team Lead'
];

const Login = ({ user, setUser }) => {
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      setError(null);
      navigate('/welcome');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    }
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <div className="App">
      <header className="App-header">
        {user ? (
          <div>
            <div className="text-center py-2 mb-4">
              <h1 className="app-title">Pearl-Wellness</h1>
            </div>
            {/* Scrollable container for tiles */}
            <div className="scrollable-tiles-container">
              {sections.map(section => {
                const sectionTiles = tileOptions.filter(tile => tile.section === section);
                if (sectionTiles.length === 0) return null;
                return (
                  <div key={section} className="mb-4 text-start">
                    <h5 className="mb-3">{section}</h5>
                    <div className="tile-row">
  {sectionTiles.map(({ label, icon, path }) => (
    <div key={path}>
      <div
        className="tile"
        onClick={() => handleNavigate(path)}
      >
        <FontAwesomeIcon
          icon={icon}
          size="lg"
          className="fa-icon"
        />
        <span>{label}</span>
      </div>
    </div>
  ))}
</div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          // Login view
          <div className="container d-flex flex-column justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 100px)' }}>
            <img
              src="/logo192.png"
              alt="Pearl-Wellness Logo"
              className="login-logo"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/150';
              }}
            />
            <button
              onClick={handleLogin}
              className="btn btn-outline-secondary google-btn"
            >
              <img
                src="https://developers.google.com/identity/images/g-logo.png"
                alt="Google logo"
                className="google-logo"
              />
              Sign in with Google
            </button>
          </div>
        )}
        {error && (
          <div className="container">
            <p className="text-danger text-center">{error}</p>
          </div>
        )}
      </header>
    </div>
  );
};

export default Login;
