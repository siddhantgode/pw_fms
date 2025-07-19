import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Papa from 'papaparse';
import { casual } from 'chrono-node'; // Use casual parser

const FoScoreSummary = ({ csvData }) => {
  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState(new Date('2025-01-01'));
  const [endDate, setEndDate] = useState(new Date('2025-05-04'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (csvData) {
      Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false,
        transformHeader: (header) => header.trim().replace(/^"|"$/g, ''),
        transform: (value, header) => value.trim().replace(/^"|"$/g, ''),
        complete: (results) => {
          const cleanedData = results.data.map(row => ({
            ...row,
            Timestamp: casual.parseDate(row["Timestamp"]) // Use casual.parseDate
          }));
          setData(cleanedData);
          setLoading(false);
        },
        error: (err) => {
          console.error('Error parsing CSV:', err);
          setLoading(false);
        }
      });
    }
  }, [csvData]);

  const filteredData = data.filter(row => {
    const rowDate = row.Timestamp;
    return rowDate instanceof Date && !isNaN(rowDate) && rowDate >= startDate && rowDate <= endDate;
  });

  const staffNames = [...new Set(filteredData.map(row => row["Staff Name"]))].sort();

  const categories = {
    "Attendance": [
      { name: "Present", variable: "On Leave", value: "Not OK" },
      { name: "Approved", variable: "On Leave", value: "OK" },
      { name: "Unapproved Leave", variable: "On Leave", value: "Not Approved" }
    ],
    "Performance": [
      { name: "Guest Handling", variable: "Guest Handling" },
      { name: "Attitude", variable: "Attitude" },
      { name: "Punctuality", variable: "Punctuality" },
      { name: "Accuracy", variable: "Accuracy" },
      { name: "Proper Documentation", variable: "Proper Documentation" }
    ],
    "Grooming": [
      { name: "Dress Code", variable: "Dress Code" },
      { name: "Hair", variable: "Hair" },
      { name: "Shoes", variable: "Shoes" },
      { name: "Nails", variable: "Nails" },
      { name: "Personal Hygiene", variable: "Personal Hygiene" },
      { name: "Shaving/Freshness", variable: "Shaving(Men)/Freshness(Female)" }
    ]
  };

  const calculateScores = () => {
    const scores = {};

    staffNames.forEach(staff => {
      scores[staff] = {};
      Object.keys(categories).forEach(category => {
        scores[staff][category] = {};
        categories[category].forEach(metric => {
          const staffData = filteredData.filter(row => 
            row["Staff Name"] === staff && 
            row.variable === (metric.variable || metric.name)
          );
          
          let score = 0;
          staffData.forEach(row => {
            const value = row.value;
            if (metric.value) {
              if (value === metric.value) score = 1;
            } else {
              score += value === "OK" ? 1 : 0;
            }
          });
          scores[staff][category][metric.name] = score;
        });
      });
    });

    return scores;
  };

  const scores = calculateScores();

  if (loading) {
    return <div className="text-center text-lg text-gray-600 p-4">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-center space-x-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <DatePicker
            selected={startDate}
            onChange={date => setStartDate(date)}
            className="border rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            dateFormat="yyyy-MM-dd"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
          <DatePicker
            selected={endDate}
            onChange={date => setEndDate(date)}
            className="border rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            dateFormat="yyyy-MM-dd"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2 text-left text-sm font-semibold text-gray-700">Category</th>
              <th className="border border-gray-300 p-2 text-left text-sm font-semibold text-gray-700">Metric</th>
              {staffNames.map(staff => (
                <th key={staff} className="border border-gray-300 p-2 text-center text-sm font-semibold text-gray-700">
                  {staff}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.keys(categories).map(category => (
              categories[category].map((metric, index) => (
                <tr key={`${category}-${metric.name}`} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  {index === 0 && (
                    <td
                      rowSpan={categories[category].length}
                      className="border border-gray-300 p-2 text-sm font-medium text-gray-700 align-top"
                    >
                      {category}
                    </td>
                  )}
                  <td className="border border-gray-300 p-2 text-sm text-gray-600">{metric.name}</td>
                  {staffNames.map(staff => (
                    <td key={staff} className="border border-gray-300 p-2 text-center text-sm text-gray-600">
                      {scores[staff][category][metric.name] || 0}
                    </td>
                  ))}
                </tr>
              ))
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FoScoreSummary;