import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import tileOptions from '../components/tiles/tileOptions';
import './Login.css';
import './MenuTiles.css';

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
              <div className="golden-line" style={{
                width: '500px',
                maxWidth: '85%',
                height: '5px',
                background: 'linear-gradient(90deg, #ffe9b3 0%, #E9A319 50%, #ffe9b3 100%)',
                borderRadius: 3,
                margin: '12px auto 0 auto',
                boxShadow: 'none',
                position: 'relative',
                overflow: 'hidden'
              }}></div>
            </div>
            {/* Scrollable container for tiles */}
            <div className="scrollable-tiles-container" style={{
                width: '100%',
                maxWidth: '100%',
                overflowX: 'hidden',
                padding: '0 6px'
              }}>
              {sections.map(section => {
                const sectionTiles = tileOptions.filter(tile => tile.section === section);
                if (sectionTiles.length === 0) return null;
                return (
                  <div key={section} className="mb-4 text-start">
                    <h5 className="section-header mb-3 px-3">{section}</h5>
                    <div className="container-fluid px-1">
                      <div className="row g-2">
                        {sectionTiles.map(({ label, icon, path }) => (
                          <div key={path} className="col-6 col-md-auto menu-tile-col mb-2">
                            <div
                              className="menu-tile"
                              onClick={() => handleNavigate(path)}
                            >
                              <FontAwesomeIcon
                                icon={icon}
                                size="lg"
                                className="fa-icon"
                                style={{ color: '#3d0066', fontSize: 18, marginRight: 8, minWidth: 22 }}
                              />
                              <span style={{ fontSize: 12, fontWeight: 600 }}>{label}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <style>{`
              
              .section-header {
                display: block;
                width: 100%;
                text-align: left;
                box-sizing: border-box;
                overflow: visible;
              }
              
              @media screen and (max-width: 768px) {
                div[style*="flex-basis"] {
                  flex-basis: unset !important;
                  width: calc(50% - 8px) !important;
                  max-width: calc(50% - 8px) !important;
                  box-sizing: border-box !important;
                }
              }
              
              /* Responsive styles for mobile */
              @media screen and (max-width: 768px) {
                body {
                  overflow-x: hidden;
                  width: 100%;
                }
                .App {
                  width: 100%;
                  overflow-x: hidden;
                  max-width: 100vw;
                }
                .App-header {
                  width: 100%;
                  padding: 0;
                  margin: 0;
                  max-width: 100vw;
                }
                .app-title {
                  font-size: 1.8rem !important;
                  padding: 0 10px;
                  margin-top: 3.5rem;
                  width: 100%;
                  text-align: center;
                }
                .golden-line {
                  max-width: 80% !important;
                  width: 260px !important;
                }
                .text-center {
                  width: 100% !important;
                }
                .col {
                  padding: 0 4px !important;
                  box-sizing: border-box;
                }
                .row {
                  margin: 0 -4px !important;
                  width: 100%;
                }
                /* Mobile tile styles moved to MenuTiles.css */
                .google-btn-violet {
                  min-width: 240px !important;
                  max-width: 85% !important;
                }
                .google-btn-violet div:last-child {
                  font-size: 14px !important;
                  padding: 0 10px !important;
                  height: 42px !important;
                }
                .google-btn-violet div:first-child {
                  width: 42px !important;
                  height: 42px !important;
                }
                .login-logo {
                  width: 80px !important;
                  height: 80px !important;
                  margin-bottom: 2rem !important;
                }
                .scrollable-tiles-container {
                  padding: 8px 8px !important;
                  margin: 1rem auto;
                  width: 100% !important;
                  max-width: 100% !important;
                  box-sizing: border-box;
                  overflow-x: hidden;
                }
                /* Section headers in mobile */
                .section-header, .mb-4.text-start h5 {
                  font-size: 1.1rem !important;
                  margin-top: 1.2rem !important;
                  margin-left: 8px !important;
                  width: calc(100% - 16px) !important;
                  box-sizing: border-box;
                  display: block;
                  text-align: left;
                  padding-left: 8px;
                  padding-right: 8px;
                  overflow: visible;
                }
                .mb-4.text-start {
                  width: 100%;
                  padding: 0;
                  box-sizing: border-box;
                  margin-bottom: 1.5rem !important;
                }
              }
              
              /* Even smaller screens */
              @media screen and (max-width: 480px) {
                .app-title {
                  font-size: 1.6rem !important;
                }
                .golden-line {
                  max-width: 85% !important;
                  width: 240px !important;
                }
                .row {
                  margin: 0 -2px !important;
                }
                .col {
                  padding: 0 2px !important;
                }
                /* Smaller screen tile styles moved to MenuTiles.css */
                .section-header, .mb-4.text-start h5 {
                  padding-left: 6px !important;
                  margin-left: 6px !important;
                }
                .scrollable-tiles-container {
                  padding: 6px !important;
                  width: calc(100% - 12px) !important;
                  margin-left: 6px !important;
                  margin-right: 6px !important;
                }
                .google-btn-violet {
                  min-width: 200px !important;
                }
                .google-btn-violet div:last-child {
                  font-size: 13px !important;
                }
                .google-btn-violet div:first-child {
                  width: 38px !important;
                  height: 38px !important;
                }
                .login-logo {
                  width: 70px !important;
                  height: 70px !important;
                }
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
              className="btn google-btn-violet"
              style={{
                borderRadius: 0,
                display: 'flex',
                alignItems: 'center',
                padding: 0,
                minWidth: 200,
                border: '2px solid #3d0066',
                background: 'transparent',
                overflow: 'hidden',
                boxShadow: 'none',
                transition: 'all 0.2s'
              }}
            >
              <div style={{
                width: 48,
                height: 48,
                background: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRight: '3px solid #3d0066',
                position: 'relative'
              }}>
                <img
                  src="https://developers.google.com/identity/images/g-logo.png"
                  alt="Google logo"
                  style={{ width: 32, height: 32, objectFit: 'contain', zIndex: 1 }}
                />
              </div>
              <div style={{
                flex: 1,
                padding: '0 24px',
                fontWeight: 600,
                fontSize: 17,
                letterSpacing: 0.2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#3d0066',
                color: '#fff',
                height: 48,
                transition: 'all 0.2s',
                border: 'none',
                borderRadius: 0
              }}>
                Sign in with Google
              </div>
            </button>
            <style>{`
              .google-btn-violet:hover,
              .google-btn-violet:focus {
                border-color: #7c2ae8 !important;
              }
              .google-btn-violet:hover div:last-child,
              .google-btn-violet:focus div:last-child {
                background: #7c2ae8 !important;
                color: #fff !important;
              }
              .google-btn-violet:active {
                border-color: #7c2ae8 !important;
              }
            `}</style>
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
