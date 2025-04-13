// src/RestaurantChecklist.js
import React from 'react';

const RestaurantChecklist = () => {
  return (
    <div className="container mt-5">
      <h1>Restaurant Checklist</h1>
      <p>This is the Restaurant Checklist page. Here you can view or manage restaurant tasks.</p>

      {/* Row 1: Two iframes side by side */}
      <div className="row mb-4">
        <div className="col-md-6 mb-4">
          <h3>Restaurant Checklist Form 1</h3>
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            <iframe
              src="https://docs.google.com/forms/d/e/1FAIpQLSe_xkKwyqjtqzXC0HAB-kqUJLzqX3mwcQGNjZrTtY-6_gyLlg/viewform?embedded=true"
              width="100%"
              height="1446"
              frameBorder="0"
              marginHeight="0"
              marginWidth="0"
            >
              Loading…
            </iframe>
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <h3>Restaurant Checklist Form 2</h3>
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            <iframe
              src="https://docs.google.com/forms/d/e/1FAIpQLSdWEkeTYII-9ABPqvEdG7V0X1TjtpVcyQyRp4G-6aSiLhhwFA/viewform?embedded=true"
              width="100%"
              height="3445"
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
          <h3>Restaurant Checklist Form 3</h3>
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            <iframe
              src="https://docs.google.com/forms/d/e/1FAIpQLSfjhRBNABAa1WuzmIfwnA-0V06_W14HusbkX_EjM2UBxULHAw/viewform?embedded=true"
              width="100%"
              height="5517"
              frameBorder="0"
              marginHeight="0"
              marginWidth="0"
            >
              Loading…
            </iframe>
          </div>
        </div>
        <div className="col-md-4 mb-4">
          <h3>Restaurant Checklist Form 4</h3>
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            <iframe
              src="https://docs.google.com/forms/d/e/1FAIpQLSd85QSzxCubw4p0KEK1Tw1pj-2eNxUCwfYuHSIGhXNqwyUeAQ/viewform?embedded=true"
              width="100%"
              height="1614"
              frameBorder="0"
              marginHeight="0"
              marginWidth="0"
            >
              Loading…
            </iframe>
          </div>
        </div>
        <div className="col-md-4 mb-4">
          <h3>Restaurant Checklist Form 5</h3>
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            <iframe
              src="https://docs.google.com/forms/d/e/1FAIpQLSfSHH0mjXWeps9DTwbAqIjVRutD_FUzFN2nxpjflasTrnZsAg/viewform?embedded=true"
              width="100%"
              height="2211"
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

export default RestaurantChecklist;