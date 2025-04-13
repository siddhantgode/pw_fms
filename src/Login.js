// src/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, provider } from './firebase';

// Import Font Awesome components and icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faList, faExchangeAlt, faBook, faPlane, faChartBar, faClipboardList, faUtensils, faHome, faWarehouse } from '@fortawesome/free-solid-svg-icons';

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

  // Render different views
  return (
    <div className="App" style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
      <header className="App-header">
        {user ? (
          // Welcome view
          <div>
            {/* Separate div for welcome text and sign-out button at the top */}
            <div className="container">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <p style={{ fontSize: '1.2rem' }}>Welcome to Team Pearl, {user.displayName || 'User'}!</p>
                <div className="d-flex align-items-center">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="User profile"
                      style={{ width: '30px', height: '30px', borderRadius: '50%', marginRight: '10px' }}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/30'; // Fallback image if photoURL fails
                        console.error('Image load error, using fallback:', e);
                      }}
                    />
                  ) : (
                    <img
                      src="https://via.placeholder.com/30"
                      alt="Default profile"
                      style={{ width: '30px', height: '30px', borderRadius: '50%', marginRight: '10px' }}
                    />
                  )}
                  <button
                    onClick={handleSignOut}
                    className="btn btn-outline-secondary btn-sm"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>

            {/* Separate div for title below welcome */}
            <div className="text-center py-2 mb-4">
              <h1 className="app-title">Pearl-Wellness</h1>
            </div>

            {/* Separate div for tiles using Bootstrap grid */}
            <div className="container">
              <div className="row justify-content-center" style={{ gap: '20px' }}>
                <div className="col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                  <div
                    className="tile"
                    onClick={() => handleNavigate('/transaction-register')}
                    style={{ height: '85%', width: '100%', padding: '10px', textAlign: 'center', cursor: 'pointer', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f9f9f9' }}
                  >
                    <FontAwesomeIcon icon={faList} size="lg" style={{ marginBottom: '5px', color: '#007bff' }} />
                    <span>Transaction Register</span>
                  </div>
                </div>
                <div className="col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                  <div
                    className="tile"
                    onClick={() => handleNavigate('/shift-handover')}
                    style={{ height: '85%', width: '100%', padding: '10px', textAlign: 'center', cursor: 'pointer', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f9f9f9' }}
                  >
                    <FontAwesomeIcon icon={faExchangeAlt} size="lg" style={{ marginBottom: '5px', color: '#007bff' }} />
                    <span>Shift Handover</span>
                  </div>
                </div>
                <div className="col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                  <div
                    className="tile"
                    onClick={() => handleNavigate('/log-book')}
                    style={{ height: '85%', width: '100%', padding: '10px', textAlign: 'center', cursor: 'pointer', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f9f9f9' }}
                  >
                    <FontAwesomeIcon icon={faBook} size="lg" style={{ marginBottom: '5px', color: '#007bff' }} />
                    <span>Log Book</span>
                  </div>
                </div>
                <div className="col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                  <div
                    className="tile"
                    onClick={() => handleNavigate('/travel-desk')}
                    style={{ height: '85%', width: '100%', padding: '10px', textAlign: 'center', cursor: 'pointer', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f9f9f9' }}
                  >
                    <FontAwesomeIcon icon={faPlane} size="lg" style={{ marginBottom: '5px', color: '#007bff' }} />
                    <span>Travel Desk</span>
                  </div>
                </div>
                <div className="col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                  <div
                    className="tile"
                    onClick={() => handleNavigate('/reports')}
                    style={{ height: '85%', width: '100%', padding: '10px', textAlign: 'center', cursor: 'pointer', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f9f9f9' }}
                  >
                    <FontAwesomeIcon icon={faChartBar} size="lg" style={{ marginBottom: '5px', color: '#007bff' }} />
                    <span>Reports</span>
                  </div>
                </div>
                <div className="col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                  <div
                    className="tile"
                    onClick={() => handleNavigate('/front-office-checklist')}
                    style={{ height: '85%', width: '100%', padding: '10px', textAlign: 'center', cursor: 'pointer', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f9f9f9' }}
                  >
                    <FontAwesomeIcon icon={faClipboardList} size="lg" style={{ marginBottom: '5px', color: '#007bff' }} />
                    <span>Front Office Checklist</span>
                  </div>
                </div>
                <div className="col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                  <div
                    className="tile"
                    onClick={() => handleNavigate('/restaurant-checklist')}
                    style={{ height: '85%', width: '100%', padding: '10px', textAlign: 'center', cursor: 'pointer', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f9f9f9' }}
                  >
                    <FontAwesomeIcon icon={faUtensils} size="lg" style={{ marginBottom: '5px', color: '#007bff' }} />
                    <span>Restaurant Checklist</span>
                  </div>
                </div>
                <div className="col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                  <div
                    className="tile"
                    onClick={() => handleNavigate('/housekeeping-checklist')}
                    style={{ height: '85%', width: '100%', padding: '10px', textAlign: 'center', cursor: 'pointer', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f9f9f9' }}
                  >
                    <FontAwesomeIcon icon={faHome} size="lg" style={{ marginBottom: '5px', color: '#007bff' }} />
                    <span>Housekeeping Checklist</span>
                  </div>
                </div>
                <div className="col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                  <div
                    className="tile"
                    onClick={() => handleNavigate('/stores-checklist')}
                    style={{ height: '85%', width: '100%', padding: '10px', textAlign: 'center', cursor: 'pointer', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f9f9f9' }}
                  >
                    <FontAwesomeIcon icon={faWarehouse} size="lg" style={{ marginBottom: '5px', color: '#007bff' }} />
                    <span>Stores Checklist</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Login view
          <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 100px)' }}>
            <button
              onClick={handleLogin}
              className="btn btn-outline-secondary d-flex align-items-center gap-2"
              style={{ fontWeight: '500', fontSize: '14px' }}
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
        {error && <div className="container"><p className="text-danger text-center">{error}</p></div>}
      </header>
    </div>
  );
};

export default Login;