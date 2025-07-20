import React, { useState, useEffect } from 'react';
import './StaffForm.css';
import { db } from '../../firebase';
import { collection, addDoc, getDocs, updateDoc, doc } from 'firebase/firestore';


const initialFormData = {
  firstName: '',
  lastName: '',
  dob: '',
  empId: '',
  doj: '',
  teamId: '',
  designationId: '',
  primaryLocation: '',
  address: '',
  phNumber: '',
  emailId: '',
  aadhar: '',
  status: '',
};

export default function StaffForm({ onUserAdded, onClose, showToast, editUser, mode }) {
  const [formData, setFormData] = useState(initialFormData);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [designationOptions, setDesignationOptions] = useState([]);
  const [teamOptions, setTeamOptions] = useState([]);
  const modalRef = React.useRef(null);

  // Add click outside handler to close the modal and manage body class
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target) && onClose) {
        onClose();
      }
    }
    
    // Add modal-open class to body to prevent white strips
    document.body.classList.add('modal-open');
    
    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);
    
    // Clean up the event listener and body class
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.classList.remove('modal-open');
    };
  }, [onClose]);

  useEffect(() => {
    // Fetch designations from personel
    async function fetchDesignations() {
      const snap = await getDocs(collection(db, 'personel'));
      const options = snap.docs.map(doc => {
        const d = doc.data();
        return d.designation ? { value: d.designation_id, label: d.designation } : null;
      }).filter(Boolean);
      setDesignationOptions(options);
    }
    // Fetch teams
    async function fetchTeams() {
      const snap = await getDocs(collection(db, 'teams'));
      const options = snap.docs.map(doc => {
        const d = doc.data();
        return d.team_name ? { value: d.team_id, label: d.team_name } : null;
      }).filter(Boolean);
      setTeamOptions(options);
    }
    fetchDesignations();
    fetchTeams();
  }, []);

  useEffect(() => {
    if (editUser) {
      setFormData({
        ...initialFormData,
        ...editUser,
        dob: editUser.dob ? editUser.dob.slice(0, 10) : '',
        doj: editUser.doj ? editUser.doj.slice(0, 10) : '',
      });
    } else {
      setFormData(initialFormData);
    }
  }, [editUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      if (!formData.firstName || !formData.lastName || !formData.emailId) {
        throw new Error('First Name, Last Name, and Email Id are required.');
      }
      // Check for duplicate employee ID only on add
      if (!editUser && formData.empId) {
        const snap = await getDocs(collection(db, 'users'));
        const exists = snap.docs.some(doc => (doc.data().empId || doc.data().employeeId) === formData.empId);
        if (exists) {
          if (showToast) showToast('User already exists.', 'error');
          setLoading(false);
          return;
        }
      }
      if (mode === 'edit' && editUser) {
        const userRef = doc(db, 'users', editUser.id);
        await updateDoc(userRef, formData);
        if (showToast) showToast('User updated successfully!', 'success');
        if (onUserAdded) onUserAdded({ ...editUser, ...formData });
        if (onClose) onClose();
      } else {
        const docRef = await addDoc(collection(db, 'users'), {
          ...formData,
          createdAt: new Date(),
        });
        setFormData(initialFormData);
        setSuccess(true);
        if (showToast) showToast('User added successfully!', 'success');
        if (onUserAdded) onUserAdded({ id: docRef.id, ...formData, createdAt: new Date() });
        if (onClose) onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to save user.');
    }
    setLoading(false);
  };

// Responsive modal and grid rendering
const fields = [
  { name: 'firstName', label: 'First Name', required: true },
  { name: 'lastName', label: 'Last Name', required: true },
  { name: 'dob', label: 'Date of Birth', type: 'date' },
  { name: 'empId', label: 'Employee ID' },
  { name: 'doj', label: 'Date of Joining', type: 'date' },
  { name: 'teamId', label: 'Team', type: 'select', options: teamOptions },
  { name: 'designationId', label: 'Designation', type: 'select', options: designationOptions },
  { name: 'primaryLocation', label: 'Primary Location' },
  { name: 'address', label: 'Address' },
  { name: 'phNumber', label: 'Phone Number' },
  { name: 'emailId', label: 'Email ID', required: true },
  { name: 'aadhar', label: 'Aadhar' },
  { name: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive', 'On Leave'] },
];

// Helper to split fields into up to 3 rows with even distribution
const splitFieldsIntoRows = (fields, maxRows = 3) => {
  if (!fields || fields.length === 0) return [];
  
  // Determine actual number of rows needed, capping at maxRows
  const numRows = Math.min(maxRows, fields.length);
  const itemsPerRow = Math.ceil(fields.length / numRows);
  
  // Create rows with items distributed evenly
  const rows = [];
  for (let i = 0; i < numRows; i++) {
    const startIdx = i * itemsPerRow;
    const endIdx = Math.min(startIdx + itemsPerRow, fields.length);
    
    // Only add row if there are fields to display
    if (startIdx < fields.length) {
      rows.push(fields.slice(startIdx, endIdx));
    }
  }
  
  return rows;
};

const fieldRows = splitFieldsIntoRows(fields, 3);

  return (
    <div className="staff-modal-overlay">
      <div className="staff-modal" ref={modalRef}>
        <div className="category-modal-header">
          <h4 className="category-modal-title">
            {mode === 'edit' ? 'Edit Staff' : 'Add Staff'}
          </h4>
        </div>
        <div className="category-modal-inner">
          <form onSubmit={handleSubmit} style={{ fontSize: 13 }}>
            <div className="container-fluid">
              {fieldRows.map((rowFields, rowIdx) => (
                <div className="row staff-form-row" key={`row-${rowIdx}`}>
                  {rowFields.map((field, idx) => {
                    // Calculate dynamic column width based on number of fields in the row
                    const colWidth = Math.floor(12 / rowFields.length);
                    // Use appropriate column class for responsive layout
                    const colClass = `col-12 col-md-${colWidth > 6 ? 6 : colWidth} mb-3`;
                    
                    return (
                      <div key={`field-${field.name}-${idx}`} className={colClass}>
                        <label htmlFor={field.name} className="form-label">
                          {field.label} {field.required && <span style={{ color: '#a30000' }}>*</span>}
                        </label>
                        {field.type === 'select' ? (
                          <select
                            id={field.name}
                            name={field.name}
                            value={formData[field.name] || ''}
                            onChange={handleChange}
                            className="form-control form-control-sm"
                            required={field.required}
                          >
                            <option value="">Select {field.label}</option>
                            {field.options && field.options.map((option, oidx) => (
                              <option key={`${field.name}-opt-${oidx}`} value={option.value || option}>
                                {option.label || option}
                              </option>
                            ))}
                          </select>
                        ) : field.type === 'textarea' ? (
                          <textarea
                            id={field.name}
                            name={field.name}
                            value={formData[field.name] || ''}
                            onChange={handleChange}
                            className="form-control form-control-sm"
                            required={field.required}
                            rows={3}
                          ></textarea>
                        ) : (
                          <input
                            type={field.type || 'text'}
                            id={field.name}
                            name={field.name}
                            value={formData[field.name] || ''}
                            onChange={handleChange}
                            className="form-control form-control-sm"
                            required={field.required}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
              <div className="row">
                <div className="col-12 d-flex justify-content-end staff-form-actions" style={{ gap: 8 }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary btn-sm" 
                    onClick={onClose} 
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-sm category-save-btn" 
                    disabled={loading}
                  >
                    {mode === 'edit' ? `Save Staff` : `Add Staff`}
                  </button>
                </div>
              </div>
              {error && <div className="alert alert-danger mt-3 w-100">{error}</div>}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
