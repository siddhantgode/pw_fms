// src/StaffScore.js
import React, { useState, useEffect } from 'react';
import { db, auth } from './firebase';
import { collection, addDoc, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

const getNameFromEmail = (email) => {
  if (!email) return 'Unknown';
  return email.split('@')[0].split('.').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
};

const StaffScore = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [scores, setScores] = useState({
    Akhil: { Attitude: true, Accuracy: true, GuestHandling: true, Documentation: true, Punctuality: true, Dress: true, Hair: true, Shoes: true, Nails: true, PersonalHygiene: true, ShavingFreshness: true },
    Vilash: { Attitude: true, Accuracy: true, GuestHandling: true, Documentation: true, Punctuality: true, Dress: true, Hair: true, Shoes: true, Nails: true, PersonalHygiene: true, ShavingFreshness: true },
    Surya: { Attitude: true, Accuracy: true, GuestHandling: true, Documentation: true, Punctuality: true, Dress: true, Hair: true, Shoes: true, Nails: true, PersonalHygiene: true, ShavingFreshness: true },
    Aruna: { Attitude: true, Accuracy: true, GuestHandling: true, Documentation: true, Punctuality: true, Dress: true, Hair: true, Shoes: true, Nails: true, PersonalHygiene: true, ShavingFreshness: true },
    Poornima: { Attitude: true, Accuracy: true, GuestHandling: true, Documentation: true, Punctuality: true, Dress: true, Hair: true, Shoes: true, Nails: true, PersonalHygiene: true, ShavingFreshness: true },
    Ajay: { Attitude: true, Accuracy: true, GuestHandling: true, Documentation: true, Punctuality: true, Dress: true, Hair: true, Shoes: true, Nails: true, PersonalHygiene: true, ShavingFreshness: true },
    Ramesh: { Attitude: true, Accuracy: true, GuestHandling: true, Documentation: true, Punctuality: true, Dress: true, Hair: true, Shoes: true, Nails: true, PersonalHygiene: true, ShavingFreshness: true },
  });
  const [locations, setLocations] = useState({
    Akhil: 'Pearl',
    Vilash: 'Pearl',
    Surya: 'Pearl',
    Aruna: 'Pearl',
    Poornima: 'Pearl',
    Ajay: 'Pearl',
    Ramesh: 'Pearl',
  });
  const [attendance, setAttendance] = useState({
    Akhil: 'Present',
    Vilash: 'Present',
    Surya: 'Present',
    Aruna: 'Present',
    Poornima: 'Present',
    Ajay: 'Present',
    Ramesh: 'Present',
  });
  const [remarks, setRemarks] = useState({
    Akhil: '',
    Vilash: '',
    Surya: '',
    Aruna: '',
    Poornima: '',
    Ajay: '',
    Ramesh: '',
  });
  const [error, setError] = useState(null);
  const [existingDocId, setExistingDocId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [lastUpdatedBy, setLastUpdatedBy] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [modalRemark, setModalRemark] = useState('');

  // Check for existing entry when date changes
  useEffect(() => {
    const checkExistingEntry = async () => {
      if (!auth.currentUser) return;

      try {
        const q = query(
          collection(db, 'foStChecklist'),
          where('date', '==', date),
          where('userId', '==', auth.currentUser.uid)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          const data = doc.data();
          setExistingDocId(doc.id);
          setIsEditing(true);

          // Load existing data into state
          setScores(data.scores || {
            Akhil: { Attitude: true, Accuracy: true, GuestHandling: true, Documentation: true, Punctuality: true, Dress: true, Hair: true, Shoes: true, Nails: true, PersonalHygiene: true, ShavingFreshness: true },
            Vilash: { Attitude: true, Accuracy: true, GuestHandling: true, Documentation: true, Punctuality: true, Dress: true, Hair: true, Shoes: true, Nails: true, PersonalHygiene: true, ShavingFreshness: true },
            Surya: { Attitude: true, Accuracy: true, GuestHandling: true, Documentation: true, Punctuality: true, Dress: true, Hair: true, Shoes: true, Nails: true, PersonalHygiene: true, ShavingFreshness: true },
            Aruna: { Attitude: true, Accuracy: true, GuestHandling: true, Documentation: true, Punctuality: true, Dress: true, Hair: true, Shoes: true, Nails: true, PersonalHygiene: true, ShavingFreshness: true },
            Poornima: { Attitude: true, Accuracy: true, GuestHandling: true, Documentation: true, Punctuality: true, Dress: true, Hair: true, Shoes: true, Nails: true, PersonalHygiene: true, ShavingFreshness: true },
            Ajay: { Attitude: true, Accuracy: true, GuestHandling: true, Documentation: true, Punctuality: true, Dress: true, Hair: true, Shoes: true, Nails: true, PersonalHygiene: true, ShavingFreshness: true },
            Ramesh: { Attitude: true, Accuracy: true, GuestHandling: true, Documentation: true, Punctuality: true, Dress: true, Hair: true, Shoes: true, Nails: true, PersonalHygiene: true, ShavingFreshness: true },
          });
          setLocations(data.locations || {
            Akhil: 'Pearl',
            Vilash: 'Pearl',
            Surya: 'Pearl',
            Aruna: 'Pearl',
            Poornima: 'Pearl',
            Ajay: 'Pearl',
            Ramesh: 'Pearl',
          });
          setAttendance(data.attendance || {
            Akhil: 'Present',
            Vilash: 'Present',
            Surya: 'Present',
            Aruna: 'Present',
            Poornima: 'Present',
            Ajay: 'Present',
            Ramesh: 'Present',
          });
          setRemarks(data.remarks || {
            Akhil: '',
            Vilash: '',
            Surya: '',
            Aruna: '',
            Poornima: '',
            Ajay: '',
            Ramesh: '',
          });

          // Set last updated information
          const timestamp = data.timestamp?.toDate ? data.timestamp.toDate().toLocaleString() : 'N/A';
          setLastUpdated(timestamp);
          setLastUpdatedBy(getNameFromEmail(data.userEmail));
        } else {
          setExistingDocId(null);
          setIsEditing(false);
          // Reset to default values if no entry exists
          setScores({
            Akhil: { Attitude: true, Accuracy: true, GuestHandling: true, Documentation: true, Punctuality: true, Dress: true, Hair: true, Shoes: true, Nails: true, PersonalHygiene: true, ShavingFreshness: true },
            Vilash: { Attitude: true, Accuracy: true, GuestHandling: true, Documentation: true, Punctuality: true, Dress: true, Hair: true, Shoes: true, Nails: true, PersonalHygiene: true, ShavingFreshness: true },
            Surya: { Attitude: true, Accuracy: true, GuestHandling: true, Documentation: true, Punctuality: true, Dress: true, Hair: true, Shoes: true, Nails: true, PersonalHygiene: true, ShavingFreshness: true },
            Aruna: { Attitude: true, Accuracy: true, GuestHandling: true, Documentation: true, Punctuality: true, Dress: true, Hair: true, Shoes: true, Nails: true, PersonalHygiene: true, ShavingFreshness: true },
            Poornima: { Attitude: true, Accuracy: true, GuestHandling: true, Documentation: true, Punctuality: true, Dress: true, Hair: true, Shoes: true, Nails: true, PersonalHygiene: true, ShavingFreshness: true },
            Ajay: { Attitude: true, Accuracy: true, GuestHandling: true, Documentation: true, Punctuality: true, Dress: true, Hair: true, Shoes: true, Nails: true, PersonalHygiene: true, ShavingFreshness: true },
            Ramesh: { Attitude: true, Accuracy: true, GuestHandling: true, Documentation: true, Punctuality: true, Dress: true, Hair: true, Shoes: true, Nails: true, PersonalHygiene: true, ShavingFreshness: true },
          });
          setLocations({
            Akhil: 'Pearl',
            Vilash: 'Pearl',
            Surya: 'Pearl',
            Aruna: 'Pearl',
            Poornima: 'Pearl',
            Ajay: 'Pearl',
            Ramesh: 'Pearl',
          });
          setAttendance({
            Akhil: 'Present',
            Vilash: 'Present',
            Surya: 'Present',
            Aruna: 'Present',
            Poornima: 'Present',
            Ajay: 'Present',
            Ramesh: 'Present',
          });
          setRemarks({
            Akhil: '',
            Vilash: '',
            Surya: '',
            Aruna: '',
            Poornima: '',
            Ajay: '',
            Ramesh: '',
          });
          setLastUpdated(null);
          setLastUpdatedBy(null);
        }
      } catch (error) {
        console.error('Error checking existing entry:', error);
        setError(`Failed to load existing data: ${error.message}`);
      }
    };

    checkExistingEntry();
  }, [date]);

  const handleCheckboxChange = (staffName, parameter) => (e) => {
    if (attendance[staffName] === 'Present') {
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
          // Update existing document with the new remark and timestamp
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

          // Fetch the latest document to update lastUpdated and lastUpdatedBy
          const q = query(
            collection(db, 'foStChecklist'),
            where('date', '==', date),
            where('userId', '==', auth.currentUser.uid)
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
          // Create new document if none exists
          const docRef = await addDoc(collection(db, 'foStChecklist'), {
            date,
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
        // Update existing document
        const docRef = doc(db, 'foStChecklist', existingDocId);
        await updateDoc(docRef, {
          date,
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
        // Add new document
        await addDoc(collection(db, 'foStChecklist'), {
          date,
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

      // Reset form after submission
      setDate(new Date().toISOString().split('T')[0]);
      setScores({
        Akhil: { Attitude: true, Accuracy: true, GuestHandling: true, Documentation: true, Punctuality: true, Dress: true, Hair: true, Shoes: true, Nails: true, PersonalHygiene: true, ShavingFreshness: true },
        Vilash: { Attitude: true, Accuracy: true, GuestHandling: true, Documentation: true, Punctuality: true, Dress: true, Hair: true, Shoes: true, Nails: true, PersonalHygiene: true, ShavingFreshness: true },
        Surya: { Attitude: true, Accuracy: true, GuestHandling: true, Documentation: true, Punctuality: true, Dress: true, Hair: true, Shoes: true, Nails: true, PersonalHygiene: true, ShavingFreshness: true },
        Aruna: { Attitude: true, Accuracy: true, GuestHandling: true, Documentation: true, Punctuality: true, Dress: true, Hair: true, Shoes: true, Nails: true, PersonalHygiene: true, ShavingFreshness: true },
        Poornima: { Attitude: true, Accuracy: true, GuestHandling: true, Documentation: true, Punctuality: true, Dress: true, Hair: true, Shoes: true, Nails: true, PersonalHygiene: true, ShavingFreshness: true },
        Ajay: { Attitude: true, Accuracy: true, GuestHandling: true, Documentation: true, Punctuality: true, Dress: true, Hair: true, Shoes: true, Nails: true, PersonalHygiene: true, ShavingFreshness: true },
        Ramesh: { Attitude: true, Accuracy: true, GuestHandling: true, Documentation: true, Punctuality: true, Dress: true, Hair: true, Shoes: true, Nails: true, PersonalHygiene: true, ShavingFreshness: true },
      });
      setLocations({
        Akhil: 'Pearl',
        Vilash: 'Pearl',
        Surya: 'Pearl',
        Aruna: 'Pearl',
        Poornima: 'Pearl',
        Ajay: 'Pearl',
        Ramesh: 'Pearl',
      });
      setAttendance({
        Akhil: 'Present',
        Vilash: 'Present',
        Surya: 'Present',
        Aruna: 'Present',
        Poornima: 'Present',
        Ajay: 'Present',
        Ramesh: 'Present',
      });
      setRemarks({
        Akhil: '',
        Vilash: '',
        Surya: '',
        Aruna: '',
        Poornima: '',
        Ajay: '',
        Ramesh: '',
      });
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
      {error && <div className="alert alert-danger text-center">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3 d-flex align-items-center justify-content-between">
          <div className="me-2">
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
                {['Akhil', 'Vilash', 'Surya', 'Aruna', 'Poornima', 'Ajay', 'Ramesh'].map((staff) => (
                  <th key={staff} className="text-center sticky-header">{staff}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="text-left fixed-column bold">Attendance</td>
                {['Akhil', 'Vilash', 'Surya', 'Aruna', 'Poornima', 'Ajay', 'Ramesh'].map((staff) => (
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
                {['Akhil', 'Vilash', 'Surya', 'Aruna', 'Poornima', 'Ajay', 'Ramesh'].map((staff) => (
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
                {['Akhil', 'Vilash', 'Surya', 'Aruna', 'Poornima', 'Ajay', 'Ramesh'].map((staff) => (
                  <td key={`subheader-${staff}`} className="text-center p-2"></td>
                ))}
              </tr>
              {['Attitude', 'Accuracy', 'GuestHandling', 'Documentation', 'Punctuality'].map((param) => (
                <tr key={param}>
                  <td className="text-left fixed-column indented">{param}</td>
                  {['Akhil', 'Vilash', 'Surya', 'Aruna', 'Poornima', 'Ajay', 'Ramesh'].map((staff) => (
                    <td key={`${staff}-${param}`} className="text-center p-2">
                      <input
                        type="checkbox"
                        checked={scores[staff][param]}
                        onChange={handleCheckboxChange(staff, param)}
                        className="form-check-input m-1"
                        style={{ transform: 'scale(1.5)', marginRight: '5px' }}
                        disabled={attendance[staff] !== 'Present'}
                      />
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <td className="text-left fixed-column subheader">Grooming</td>
                {['Akhil', 'Vilash', 'Surya', 'Aruna', 'Poornima', 'Ajay', 'Ramesh'].map((staff) => (
                  <td key={`subheader-grooming-${staff}`} className="text-center p-2"></td>
                ))}
              </tr>
              {['Dress', 'Hair', 'Shoes', 'Nails', 'PersonalHygiene', 'ShavingFreshness'].map((param) => (
                <tr key={param}>
                  <td className="text-left fixed-column indented">{param}</td>
                  {['Akhil', 'Vilash', 'Surya', 'Aruna', 'Poornima', 'Ajay', 'Ramesh'].map((staff) => (
                    <td key={`${staff}-${param}`} className="text-center p-2">
                      <input
                        type="checkbox"
                        checked={scores[staff][param]}
                        onChange={handleCheckboxChange(staff, param)}
                        className="form-check-input m-1"
                        style={{ transform: 'scale(1.5)', marginRight: '5px' }}
                        disabled={attendance[staff] !== 'Present'}
                      />
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <td className="text-left fixed-column subheader">Remarks</td>
                {['Akhil', 'Vilash', 'Surya', 'Aruna', 'Poornima', 'Ajay', 'Ramesh'].map((staff) => (
                  <td key={`remarks-${staff}`} className="text-center p-2">
                    <button
                      type="button" // Prevent form submission
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

      <style jsx>{`
        .fixed-column {
          position: sticky;
          left: 0;
          background-color: #f8f9fa;
          z-index: 4; /* Higher than sticky-header to stay above */
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
          z-index: 3; /* Below fixed-column but above table body */
        }
        .sticky-header:first-child {
          position: sticky;
          left: 0;
          z-index: 5; /* Highest z-index to stay above everything */
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
          font-size: 0.9em; /* Reduced font size */
          margin-left: auto; /* Moves to the right side */
        }
      `}</style>
    </div>
  );
};

export default StaffScore;