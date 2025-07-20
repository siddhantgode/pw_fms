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
                    <div className="tile-row" style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                      {sectionTiles.map(({ label, icon, path }) => (
                        <div key={path} style={{ height: 75, display: 'flex', alignItems: 'flex-end' }}>
                          <div
                            className="tile"
                            onClick={() => handleNavigate(path)}
                            style={{
                              height: '100%',
                              minWidth: 140,
                              maxWidth: '100%',
                              borderRadius: 0,
                              border: '1px solid #3d0066',
                              background: '#fff',
                              color: '#3d0066',
                              boxShadow: '0 2px 8px rgba(61,0,102,0.04)',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              padding: '0 18px 18px 10px',
                              margin: 0,
                              fontWeight: 500,
                              fontSize: 13,
                              letterSpacing: 0.2,
                              outline: 'none',
                              outlineOffset: 0,
                              position: 'relative',
                              display: 'flex',
                              flexDirection: 'row',
                              alignItems: 'flex-end',
                              justifyContent: 'flex-start',
                              textAlign: 'left',
                              gap: 10
                            }}
                          >
                            <FontAwesomeIcon
                              icon={icon}
                              size="lg"
                              className="fa-icon"
                              style={{ color: '#3d0066', fontSize: 18, transition: 'color 0.2s', marginRight: 8, minWidth: 22, textAlign: 'left', alignSelf: 'flex-end' }}
                            />
                            <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: 0.2, textAlign: 'left', flex: 1, alignSelf: 'flex-end' }}>{label}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <style>{`
              .tile {
                transition: all 0.2s cubic-bezier(0.4,0,0.2,1);
              }
              .tile:hover {
                background: #3d0066 !important;
                color: #fff !important;
                border-color: #3d0066 !important;
                box-shadow: 0 4px 24px rgba(61,0,102,0.13) !important;
                transform: scale(1.08);
              }
              .tile:hover .fa-icon {
                color: #fff !important;
              }
            `}</style>
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
