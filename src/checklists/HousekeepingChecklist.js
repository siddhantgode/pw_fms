// src/HousekeepingChecklist.js
import React from 'react';

const HousekeepingChecklist = () => {
  return (
    <div className="container mt-5">
      <h1>Housekeeping Checklist</h1>
      <p>This is the Housekeeping Checklist page. Here you can view or manage housekeeping tasks.</p>

      {/* Row 1: Two iframes side by side */}
      <div className="row mb-4">
        <div className="col-md-6 mb-4">
          <h3>Housekeeping Checklist Form 1</h3>
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            <iframe
              src="https://docs.google.com/forms/d/e/1FAIpQLSdTrkV8HDNPJqtK0SJEGiWTogaB4ADXeMaFg1ijDpv8R-2CPA/viewform?embedded=true"
              width="100%"
              height="3618"
              frameBorder="0"
              marginHeight="0"
              marginWidth="0"
            >
              Loading…
            </iframe>
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <h3>Housekeeping Checklist Form 2</h3>
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            <iframe
              src="https://docs.google.com/forms/d/e/1FAIpQLSeh3lEM_Ln80Z9QPhZgZF1dvS5X2l08dOhPehEV7cqU_aysig/viewform?embedded=true"
              width="100%"
              height="4638"
              frameBorder="0"
              marginHeight="0"
              marginWidth="0"
            >
              Loading…
            </iframe>
          </div>
        </div>
      </div>

      {/* Row 2: Three iframes side by side */}
      <div className="row">
        <div className="col-md-4 mb-4">
          <h3>Housekeeping Checklist Form 3</h3>
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            <iframe
              src="https://docs.google.com/forms/d/e/1FAIpQLSejGkoyyGFWKRzPWAlrXQDQcjhBn3NSRkCR_EM70qMylXWpCA/viewform?embedded=true"
              width="100%"
              height="2775"
              frameBorder="0"
              marginHeight="0"
              marginWidth="0"
            >
              Loading…
            </iframe>
          </div>
        </div>
        <div className="col-md-4 mb-4">
          <h3>Housekeeping Checklist Form 4</h3>
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            <iframe
              src="https://docs.google.com/forms/d/e/1FAIpQLScPeHLy7ssGQuNFrUG_DBbfFxeVbOf-diLC8bbIRjQYrxpxYA/viewform?embedded=true"
              width="100%"
              height="2406"
              frameBorder="0"
              marginHeight="0"
              marginWidth="0"
            >
              Loading…
            </iframe>
          </div>
        </div>
        <div className="col-md-4 mb-4">
          <h3>Housekeeping Checklist Form 5</h3>
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            <iframe
              src="https://docs.google.com/forms/d/e/1FAIpQLSf65GlQo5GaHmK0iyeqPGfSamYztiUk4XqTmbFNenf4zQ-YPA/viewform?embedded=true"
              width="100%"
              height="3312"
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

export default HousekeepingChecklist;