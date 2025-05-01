// src/FrontOfficeChecklist.js
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faFileAlt } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from './AuthContext';

const FrontOfficeChecklist = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const allowedEmails = [
    'siddhant.gode@volunteer.heartfulness.org',
    'pearl.manager@heartfulness.org',
  ];

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <div className="container mt-5">
      <h1>Front Office Checklist</h1>
      <p>This is the Front Office Checklist page. Here you can view or manage front office tasks.</p>

      {/* New div with two tiles */}
      <div className="row mb-4">
        {user && allowedEmails.includes(user.email) && (
          <div className="col-md-6 mb-3">
            <div
              className="tile"
              onClick={() => handleNavigate('/staff-score')}
              style={{
                height: '85%',
                width: '100%',
                padding: '10px',
                textAlign: 'center',
                cursor: 'pointer',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: '#f9f9f9',
              }}
            >
              <FontAwesomeIcon icon={faStar} size="lg" style={{ marginBottom: '5px', color: '#007bff' }} />
              <span>Staff Score</span>
            </div>
          </div>
        )}
        <div className="col-md-6 mb-3">
          <div
            className="tile"
            onClick={() => handleNavigate('/front-office-summary')}
            style={{
              height: '85%',
              width: '100%',
              padding: '10px',
              textAlign: 'center',
              cursor: 'pointer',
              border: '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: '#f9f9f9',
            }}
          >
            <FontAwesomeIcon icon={faFileAlt} size="lg" style={{ marginBottom: '5px', color: '#007bff' }} />
            <span>Front Office Summary</span>
          </div>
        </div>
      </div>

      {/* Existing iframes */}
      <div className="row">
        <div className="col-md-6 mb-4">
          <h3>Front Office Checklist Form 1</h3>
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            <iframe
              src="https://docs.google.com/forms/d/e/1FAIpQLSfMkyjcFyBjVVbhKj-dLtiEQEv8RHK78IMg3aHpYllBxt8M2w/viewform?embedded=true"
              width="100%"
              height="2431"
              frameBorder="0"
              marginHeight="0"
              marginWidth="0"
            >
              Loading…
            </iframe>
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <h3>Front Office Checklist Form 2</h3>
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            <iframe
              src="https://docs.google.com/forms/d/e/1FAIpQLSfMkyjcFyBjVVbhKj-dLtiEQEv8RHK78IMg3aHpYllBxt8M2w/viewform?embedded=true"
              width="100%"
              height="2431"
              frameBorder="0"
              marginHeight="0"
              marginWidth="0"
            >
              Loading…
            </iframe>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FrontOfficeChecklist;