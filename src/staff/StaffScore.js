import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, query, where, getDocs, updateDoc, doc, orderBy } from 'firebase/firestore';

const getNameFromEmail = (email) => {
  if (!email) return 'Unknown';
  return email.split('@')[0].split('.').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
};

const staffNames = ['Akhil', 'Ajay', 'Aruna', 'Gaurav', 'Poornima', 'Ramesh', 'Surya', 'Vilash'].sort();

const StaffScore = () => {
  const initialScores = staffNames.reduce((acc, name) => ({
    ...acc,
    [name]: { Attitude: true, Accuracy: true, GuestHandling: true, Documentation: true, Punctuality: true, Dress: true, Hair: true, Shoes: true, Nails: true, PersonalHygiene: true, ShavingFreshness: true }
  }), {});
  
  const initialLocations = staffNames.reduce((acc, name) => ({
    ...acc,
    [name]: 'Pearl'
  }), {});
  
  const initialAttendance = staffNames.reduce((acc, name) => ({
    ...acc,
    [name]: 'Present'
  }), {});
  
  const initialRemarks = staffNames.reduce((acc, name) => ({
    ...acc,
    [name]: ''
  }), {});

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [primaryLocation, setPrimaryLocation] = useState('Pearl');
  const [scores, setScores] = useState(initialScores);
  const [locations, setLocations] = useState(initialLocations);
  const [attendance, setAttendance] = useState(initialAttendance);
  const [remarks, setRemarks] = useState(initialRemarks);
  const [error, setError] = useState(null);
  const [existingDocId, setExistingDocId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [lastUpdatedBy, setLastUpdatedBy] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [modalRemark, setModalRemark] = useState('');
  const [viewPrevious, setViewPrevious] = useState(false);
  const [previousEntries, setPreviousEntries] = useState([]);

  useEffect(() => {
    if (viewPrevious) return;

    const checkExistingEntry = async () => {
      if (!auth.currentUser) return;

      try {
        const q = query(
          collection(db, 'foStChecklist'),
          where('date', '==', date),
          where('userId', '==', auth.currentUser.uid),
          where('primaryLocation', '==', primaryLocation)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          const data = doc.data();
          setExistingDocId(doc.id);
          setIsEditing(true);

          setScores(data.scores || initialScores);
          setLocations(data.locations || initialLocations);
          setAttendance(data.attendance || initialAttendance);
          setRemarks(data.remarks || initialRemarks);

          const timestamp = data.timestamp?.toDate ? data.timestamp.toDate().toLocaleString() : 'N/A';
          setLastUpdated(timestamp);
          setLastUpdatedBy(getNameFromEmail(data.userEmail));
        } else {
          setExistingDocId(null);
          setIsEditing(false);
          setScores(initialScores);
          setLocations(initialLocations);
          setAttendance(initialAttendance);
          setRemarks(initialRemarks);
          setLastUpdated(null);
          setLastUpdatedBy(null);
        }
      } catch (error) {
        console.error('Error checking existing entry:', error);
        setError(`Failed to load existing data: ${error.message}`);
      }
    };

    checkExistingEntry();
  }, [date, primaryLocation, viewPrevious]);

  useEffect(() => {
    if (!viewPrevious) return;

    const fetchPreviousEntries = async () => {
      if (!auth.currentUser) {
        setPreviousEntries([]); // Reset entries if no user
        return;
      }

      try {
        const q = query(
          collection(db, 'foStChecklist'),
          where('userId', '==', auth.currentUser.uid),
          orderBy('date', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const entries = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate ? doc.data().timestamp.toDate().toLocaleString() : 'N/A',
          updatedBy: getNameFromEmail(doc.data().userEmail),
        }));
        setPreviousEntries(entries);
      } catch (error) {
        console.error('Error fetching previous entries:', error);
        setPreviousEntries([]); // Reset entries on error, but don't set error state
      }
    };

    fetchPreviousEntries();
  }, [viewPrevious]);

  const handleCheckboxChange = (staffName, parameter) => (e) => {
    if (attendance[staffName] === 'Present' && locations[staffName] === primaryLocation) {
      setScores((prevScores) => ({
        ...prevScores,
        [staffName]: {
          ...prevScores[staffName],
          [parameter]: e.target.checked,
        },
      }));
    }
  };

  const handleLocationChange = (staffName) => (e) => {
    setLocations((prevLocations) => ({
      ...prevLocations,
      [staffName]: e.target.value,
    }));
  };

  const handleAttendanceChange = (staffName) => (e) => {
    const newAttendance = e.target.value;
    setAttendance((prevAttendance) => ({
      ...prevAttendance,
      [staffName]: newAttendance,
    }));
    if (newAttendance === 'Apr. Leave') {
      setScores((prevScores) => ({
        ...prevScores,
        [staffName]: {
          Attitude: true,
          Accuracy: true,
          GuestHandling: true,
          Documentation: true,
          Punctuality: true,
          Dress: true,
          Hair: true,
          Shoes: true,
          Nails: true,
          PersonalHygiene: true,
          ShavingFreshness: true,
        },
      }));
    } else if (newAttendance === 'Unapr. Leave') {
      setScores((prevScores) => ({
        ...prevScores,
        [staffName]: {
          Attitude: false,
          Accuracy: false,
          GuestHandling: false,
          Documentation: false,
          Punctuality: false,
          Dress: false,
          Hair: false,
          Shoes: false,
          Nails: false,
          PersonalHygiene: false,
          ShavingFreshness: false,
        },
      }));
    }
  };

  const openModal = (staffName) => {
    setSelectedStaff(staffName);
    setModalRemark(remarks[staffName] || '');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedStaff(null);
    setModalRemark('');
  };

  const saveRemark = async () => {
    if (selectedStaff && auth.currentUser) {
      const newRemark = modalRemark;
      setRemarks((prevRemarks) => ({
        ...prevRemarks,
        [selectedStaff]: newRemark,
      }));

      try {
        if (existingDocId) {
          const docRef = doc(db, 'foStChecklist', existingDocId);
          await updateDoc(docRef, {
            remarks: {
              ...remarks,
              [selectedStaff]: newRemark,
            },
            timestamp: new Date(),
            userId: auth.currentUser.uid,
            userEmail: auth.currentUser.email,
          });

          const q = query(
            collection(db, 'foStChecklist'),
            where('date', '==', date),
            where('userId', '==', auth.currentUser.uid),
            where('primaryLocation', '==', primaryLocation)
          );
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            const data = doc.data();
            const timestamp = data.timestamp?.toDate ? data.timestamp.toDate().toLocaleString() : 'N/A';
            setLastUpdated(timestamp);
            setLastUpdatedBy(getNameFromEmail(data.userEmail));
          }
        } else {
          const docRef = await addDoc(collection(db, 'foStChecklist'), {
            date,
            primaryLocation,
            scores,
            locations,
            attendance,
            remarks: {
              ...remarks,
              [selectedStaff]: newRemark,
            },
            timestamp: new Date(),
            userId: auth.currentUser.uid,
            userEmail: auth.currentUser.email,
          });
          setExistingDocId(docRef.id);
          setIsEditing(true);
          const timestamp = new Date().toLocaleString();
          setLastUpdated(timestamp);
          setLastUpdatedBy(getNameFromEmail(auth.currentUser.email));
        }
      } catch (error) {
        console.error('Error updating remark:', error);
        setError(`Failed to update remark: ${error.message}`);
      }

      closeModal();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    console.log('Current user:', auth.currentUser);

    if (!auth.currentUser) {
      setError('You must be signed in to submit scores.');
      return;
    }

    try {
      if (isEditing && existingDocId) {
        const docRef = doc(db, 'foStChecklist', existingDocId);
        await updateDoc(docRef, {
          date,
          primaryLocation,
          scores,
          locations,
          attendance,
          remarks,
          timestamp: new Date(),
          userId: auth.currentUser.uid,
          userEmail: auth.currentUser.email,
        });
        alert('Scores updated successfully!');
      } else {
        await addDoc(collection(db, 'foStChecklist'), {
          date,
          primaryLocation,
          scores,
          locations,
          attendance,
          remarks,
          timestamp: new Date(),
          userId: auth.currentUser.uid,
          userEmail: auth.currentUser.email,
        });
        alert('Scores submitted successfully!');
      }

      setDate(new Date().toISOString().split('T')[0]);
      setPrimaryLocation('Pearl');
      setScores(initialScores);
      setLocations(initialLocations);
      setAttendance(initialAttendance);
      setRemarks(initialRemarks);
      setIsEditing(false);
      setExistingDocId(null);
      setLastUpdated(null);
      setLastUpdatedBy(null);
    } catch (error) {
      console.error('Error submitting/updating scores:', error);
      setError(`Failed to submit/update scores: ${error.message}`);
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="text-left">Staff Score</h1>
      <div className="mb-3">
        <button
          className={`btn ${viewPrevious ? 'btn-outline-primary' : 'btn-primary'} me-2`}
          onClick={() => setViewPrevious(false)}
        >
          Add New
        </button>
        <button
          className={`btn ${viewPrevious ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => setViewPrevious(true)}
        >
          View Previous
        </button>
      </div>

      {error && <div className="alert alert-danger text-center">{error}</div>}

      {!viewPrevious ? (
        <form onSubmit={handleSubmit}>
          <div className="mb-3 d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <div className="me-3">
                <label htmlFor="date" className="form-label me-2">Date:</label>
                <input
                  type="date"
                  id="date"
                  className="form-control date-input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="primaryLocation" className="form-label me-2">Primary Location:</label>
                <select
                  id="primaryLocation"
                  className="form-select"
                  value={primaryLocation}
                  onChange={(e) => setPrimaryLocation(e.target.value)}
                  style={{ width: 'auto', display: 'inline-block' }}
                >
                  <option value="Pearl">Pearl</option>
                  <option value="Wellness">Wellness</option>
                </select>
              </div>
            </div>
            <div>
              <span className="text-muted last-updated-text">
                Last Updated: {lastUpdated ? lastUpdated : 'N/A'} by {lastUpdatedBy ? lastUpdatedBy : 'N/A'}
              </span>
            </div>
          </div>

          <div className="table-responsive" style={{ maxWidth: '100%', overflowX: 'auto', maxHeight: '500px', overflowY: 'auto' }}>
            <table className="table table-bordered table-striped">
              <thead>
                <tr>
                  <th className="text-left fixed-column sticky-header">Parameter/Staff</th>
                  {staffNames.map((staff) => (
                    <th key={staff} className="text-center sticky-header">{staff}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="text-left fixed-column bold">Attendance</td>
                  {staffNames.map((staff) => (
                    <td key={`attendance-${staff}`} className="text-center p-2">
                      <select
                        className="form-select"
                        value={attendance[staff]}
                        onChange={handleAttendanceChange(staff)}
                        style={{ width: '100%' }}
                      >
                        <option value="Present">Present</option>
                        <option value="Apr. Leave">Apr. Leave</option>
                        <option value="Unapr. Leave">Unapr. Leave</option>
                      </select>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="text-left fixed-column bold">Location</td>
                  {staffNames.map((staff) => (
                    <td key={`location-${staff}`} className="text-center p-2">
                      <select
                        className="form-select"
                        value={locations[staff]}
                        onChange={handleLocationChange(staff)}
                        style={{ width: '100%' }}
                      >
                        <option value="Pearl">Pearl</option>
                        <option value="Wellness">Wellness</option>
                      </select>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="text-left fixed-column subheader">Performance</td>
                  {staffNames.map((staff) => (
                    <td key={`subheader-${staff}`} className="text-center p-2"></td>
                  ))}
                </tr>
                {['Attitude', 'Accuracy', 'GuestHandling', 'Documentation', 'Punctuality'].map((param) => (
                  <tr key={param}>
                    <td className="text-left fixed-column indented">{param}</td>
                    {staffNames.map((staff) => (
                      <td key={`${staff}-${param}`} className="text-center p-2">
                        <input
                          type="checkbox"
                          checked={scores[staff][param]}
                          onChange={handleCheckboxChange(staff, param)}
                          className="form-check-input m-1"
                          style={{ transform: 'scale(1.5)', marginRight: '5px' }}
                          disabled={attendance[staff] !== 'Present' || locations[staff] !== primaryLocation}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <td className="text-left fixed-column subheader">Grooming</td>
                  {staffNames.map((staff) => (
                    <td key={`subheader-grooming-${staff}`} className="text-center p-2"></td>
                  ))}
                </tr>
                {['Dress', 'Hair', 'Shoes', 'Nails', 'PersonalHygiene', 'ShavingFreshness'].map((param) => (
                  <tr key={param}>
                    <td className="text-left fixed-column indented">{param}</td>
                    {staffNames.map((staff) => (
                      <td key={`${staff}-${param}`} className="text-center p-2">
                        <input
                          type="checkbox"
                          checked={scores[staff][param]}
                          onChange={handleCheckboxChange(staff, param)}
                          className="form-check-input m-1"
                          style={{ transform: 'scale(1.5)', marginRight: '5px' }}
                          disabled={attendance[staff] !== 'Present' || locations[staff] !== primaryLocation}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <td className="text-left fixed-column subheader">Remarks</td>
                  {staffNames.map((staff) => (
                    <td key={`remarks-${staff}`} className="text-center p-2">
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => openModal(staff)}
                      >
                        {remarks[staff] ? 'Edit Remark' : 'Add Remark'}
                      </button>
                      {remarks[staff] && (
                        <div className="text-muted small mt-1 remark-text">
                          {remarks[staff]}
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          <div className="text-center mt-4">
            <button type="submit" className="btn btn-primary btn-lg">
              {isEditing ? 'Edit Scores' : 'Submit Scores'}
            </button>
          </div>

          {modalOpen && (
            <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Remarks for {selectedStaff}</h5>
                    <button type="button" className="btn-close" onClick={closeModal}></button>
                  </div>
                  <div className="modal-body">
                    <textarea
                      className="form-control"
                      value={modalRemark}
                      onChange={(e) => setModalRemark(e.target.value)}
                      rows="4"
                      placeholder="Enter remarks here..."
                    ></textarea>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                    <button type="button" className="btn btn-primary" onClick={saveRemark}>Save</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>
      ) : (
        <div className="previous-entries">
          <h2>Previous Entries</h2>
          {previousEntries.length > 0 ? (
            previousEntries.map((entry) => (
              <div key={entry.id} className="entry mb-4 p-3 border rounded">
                <h4>Date: {entry.date} | Primary Location: {entry.primaryLocation}</h4>
                <p>Last Updated: {entry.timestamp} by {entry.updatedBy}</p>
                <h5>Attendance</h5>
                <ul>
                  {Object.entries(entry.attendance).map(([staff, status]) => (
                    <li key={staff}>{staff}: {status}</li>
                  ))}
                </ul>
                <h5>Locations</h5>
                <ul>
                  {Object.entries(entry.locations).map(([staff, location]) => (
                    <li key={staff}>{staff}: {location}</li>
                  ))}
                </ul>
                <h5>Scores</h5>
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>Staff</th>
                      <th>Attitude</th>
                      <th>Accuracy</th>
                      <th>GuestHandling</th>
                      <th>Documentation</th>
                      <th>Punctuality</th>
                      <th>Dress</th>
                      <th>Hair</th>
                      <th>Shoes</th>
                      <th>Nails</th>
                      <th>PersonalHygiene</th>
                      <th>ShavingFreshness</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(entry.scores).map(([staff, score]) => (
                      <tr key={staff}>
                        <td>{staff}</td>
                        <td>{score.Attitude ? '✓' : '✗'}</td>
                        <td>{score.Accuracy ? '✓' : '✗'}</td>
                        <td>{score.GuestHandling ? '✓' : '✗'}</td>
                        <td>{score.Documentation ? '✓' : '✗'}</td>
                        <td>{score.Punctuality ? '✓' : '✗'}</td>
                        <td>{score.Dress ? '✓' : '✗'}</td>
                        <td>{score.Hair ? '✓' : '✗'}</td>
                        <td>{score.Shoes ? '✓' : '✗'}</td>
                        <td>{score.Nails ? '✓' : '✗'}</td>
                        <td>{score.PersonalHygiene ? '✓' : '✗'}</td>
                        <td>{score.ShavingFreshness ? '✓' : '✗'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <h5>Remarks</h5>
                <ul>
                  {Object.entries(entry.remarks).map(([staff, remark]) => (
                    remark && <li key={staff}>{staff}: {remark}</li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <p>No previous entries found.</p>
          )}
        </div>
      )}

      <style jsx>{`
        .fixed-column {
          position: sticky;
          left: 0;
          background-color: #f8f9fa;
          z-index: 4;
          min-width: 150px;
        }
        .subheader {
          font-weight: bold;
          background-color: #e9ecef;
        }
        .indented {
          padding-left: 30px;
        }
        .bold {
          font-weight: bold;
        }
        th, td {
          white-space: nowrap;
        }
        .table-responsive {
          -webkit-overflow-scrolling: touch;
        }
        .date-input {
          width: auto;
          display: inline-block;
        }
        .sticky-header {
          position: sticky;
          top: 0;
          background-color: #f8f9fa;
          z-index: 3;
        }
        .sticky-header:first-child {
          position: sticky;
          left: 0;
          z-index: 5;
        }
        .modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1000;
        }
        .modal-dialog {
          margin: 1.75rem auto;
        }
        .modal-content {
          background-color: #fff;
          border-radius: 0.3rem;
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
        }
        .btn-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
        }
        .remark-text {
          white-space: normal;
          word-wrap: break-word;
        }
        .last-updated-text {
          font-size: 0.9em;
          margin-left: auto;
        }
        .previous-entries .entry {
          background-color: #f9f9f9;
        }
        .previous-entries h5 {
          margin-top: 1rem;
          font-size: 1.1rem;
        }
        .previous-entries ul {
          padding-left: 20px;
        }
      `}</style>
    </div>
  );
};

export default StaffScore;