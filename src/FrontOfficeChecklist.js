// src/FrontOfficeChecklist.js
import React from 'react';

const FrontOfficeChecklist = () => {
  return (
    <div className="container mt-5">
      {/* Row to place iframes side by side */}
      <div className="row">
        {/* First iframe in a column */}
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

        {/* Second iframe in a column */}
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