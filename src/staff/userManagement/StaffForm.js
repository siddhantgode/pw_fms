import React, { useState, useEffect } from 'react';
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
      if (editUser) {
        // Update user in Firestore
        const userRef = doc(db, 'users', editUser.id);
        await updateDoc(userRef, {
          ...formData,
        });
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
      setError(err.message || 'Failed to add user.');
    }
    setLoading(false);
  };

  return (
    <>
      <div>
        <div style={{
          background: '#3d0066',
          color: '#fff',
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          padding: '14px 24px 10px 24px',
          margin: '-24px -24px 18px -24px',
          minHeight: 40,
          display: 'flex',
          alignItems: 'center',
        }}>
          <h4 style={{ fontSize: 20, margin: 0, color: '#fff', fontWeight: 600, letterSpacing: 0.5 }}>{mode === 'edit' ? 'Edit User' : 'Add User'}</h4>
        </div>
        <form onSubmit={handleSubmit} style={{ fontSize: 13 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Row 1 */}
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <label className="form-label" htmlFor="firstName">First Name *</label>
                <input name="firstName" id="firstName" value={formData.firstName} onChange={handleChange} className="form-control form-control-sm" style={{ borderRadius: 0, border: '1px solid #888' }} required />
              </div>
              <div style={{ flex: 1 }}>
                <label className="form-label" htmlFor="lastName">Last Name *</label>
                <input name="lastName" id="lastName" value={formData.lastName} onChange={handleChange} className="form-control form-control-sm" style={{ borderRadius: 0, border: '1px solid #888' }} required />
              </div>
              <div style={{ flex: 1 }}>
                <label className="form-label" htmlFor="dob">Date of Birth</label>
                <input type="date" name="dob" id="dob" value={formData.dob} onChange={handleChange} className="form-control form-control-sm" style={{ borderRadius: 0, border: '1px solid #888' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label className="form-label" htmlFor="empId">Employee ID</label>
                <input name="empId" id="empId" value={formData.empId} onChange={handleChange} className="form-control form-control-sm" style={{ borderRadius: 0, border: '1px solid #888' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label className="form-label" htmlFor="doj">Date of Joining</label>
                <input type="date" name="doj" id="doj" value={formData.doj} onChange={handleChange} className="form-control form-control-sm" style={{ borderRadius: 0, border: '1px solid #888' }} />
              </div>
            </div>
            {/* Row 2 */}
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <label className="form-label" htmlFor="teamId">Team</label>
                <select name="teamId" id="teamId" value={formData.teamId} onChange={handleChange} className="form-control form-control-sm" style={{ borderRadius: 0, border: '1px solid #888' }}>
                  <option value="">Select Team</option>
                  {teamOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label className="form-label" htmlFor="designationId">Designation</label>
                <select name="designationId" id="designationId" value={formData.designationId} onChange={handleChange} className="form-control form-control-sm" style={{ borderRadius: 0, border: '1px solid #888' }}>
                  <option value="">Select Designation</option>
                  {designationOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label className="form-label" htmlFor="primaryLocation">Primary Location</label>
                <select name="primaryLocation" id="primaryLocation" value={formData.primaryLocation} onChange={handleChange} className="form-control form-control-sm" style={{ borderRadius: 0, border: '1px solid #888' }}>
                  <option value="">Select Location</option>
                  <option value="Pearl">Pearl</option>
                  <option value="Wellness">Wellness</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label className="form-label" htmlFor="address">Address</label>
                <input name="address" id="address" value={formData.address} onChange={handleChange} className="form-control form-control-sm" style={{ borderRadius: 0, border: '1px solid #888' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label className="form-label" htmlFor="phNumber">Phone Number</label>
                <input name="phNumber" id="phNumber" value={formData.phNumber} onChange={handleChange} className="form-control form-control-sm" style={{ borderRadius: 0, border: '1px solid #888' }} />
              </div>
            </div>
            {/* Row 3 */}
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <label className="form-label" htmlFor="emailId">Email ID *</label>
                <input type="email" name="emailId" id="emailId" value={formData.emailId} onChange={handleChange} className="form-control form-control-sm" style={{ borderRadius: 0, border: '1px solid #888' }} required />
              </div>
              <div style={{ flex: 1 }}>
                <label className="form-label" htmlFor="aadhar">Aadhar</label>
                <input name="aadhar" id="aadhar" value={formData.aadhar} onChange={handleChange} className="form-control form-control-sm" style={{ borderRadius: 0, border: '1px solid #888' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label className="form-label" htmlFor="status">Status</label>
                <select name="status" id="status" value={formData.status} onChange={handleChange} className="form-control form-control-sm" style={{ borderRadius: 0, border: '1px solid #888' }}>
                  <option value="">Select Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div style={{ flex: 1 }}></div>
              <div style={{ flex: 1 }}></div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
            <button type="button" className="btn btn-secondary btn-sm" style={{ borderRadius: 0, border: '1px solid #888' }} onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm" style={{ borderRadius: 0, border: '1px solid #888', background: '#3d0066', color: '#fff' }} disabled={loading}>{mode === 'edit' ? 'Edit User' : 'Add User'}</button>
          </div>
          {success && <div className="alert alert-success mt-2">User added successfully!</div>}
          {error && <div className="alert alert-danger mt-2">{error}</div>}
        </form>
      </div>
    </>
  );
}
