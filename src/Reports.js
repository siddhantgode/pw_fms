// src/Reports.js
import React from 'react';

const Reports = () => {
  return (
    <div className="container mt-5">
      <h1>Reports</h1>
      <p>This is the Reports page featuring your embedded Power BI report.</p>
      {/* Embedded Power BI report iframe */}
      <iframe
        title="team_pearl"
        width="1000"
        height="500"
        src="https://app.powerbi.com/view?r=eyJrIjoiNTU4MTljZWQtM2IzOS00YjUyLWEyYWQtOWU2MTI4OTI2YzZmIiwidCI6ImRmODY3OWNkLWE4MGUtNDVkOC05OWFjLWM4M2VkN2ZmOTVhMCJ9"
        frameBorder="0"
        allowFullScreen="true"
      ></iframe>
    </div>
  );
};

export default Reports;