// src/UserManagement.js
import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, addDoc, query, getDocs,serverTimestamp } from 'firebase/firestore';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    mobileNo: '',
    emailId: '',
    employeeId: '',
    aadharNo: '',
    team: 'HK',
    designation: 'Manager',
    defaultLocation: 'Pearl',
    status: 'Active',
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch all users from Firestore on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const q = query(collection(db, 'users'));
        const querySnapshot = await getDocs(q);
        const usersList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersList);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(err.message || 'Failed to load users. Please try again.');
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      // Validate required fields
      if (!formData.firstName || !formData.lastName || !formData.emailId || !formData.mobileNo) {
        throw new Error('First Name, Last Name, Email Id, and Mobile No. are required.');
      }

      // Add data to Firestore 'users' collection
      const docRef = await addDoc(collection(db, 'users'), {
        ...formData,
        createdAt: serverTimestamp(),

      });

      // Update the users list with the new user
      setUsers((prevUsers) => [
        ...prevUsers,
        {
          id: docRef.id,
          ...formData,
          createdAt: new Date(),
        },
      ]);

      // Reset form and hide it
      setFormData({
        firstName: '',
        lastName: '',
        mobileNo: '',
        emailId: '',
        employeeId: '',
        aadharNo: '',
        team: 'HK',
        designation: 'Manager',
        defaultLocation: 'Pearl',
        status: 'Active',
      });
      setShowForm(false);
      setSuccess(true);
    } catch (err) {
      console.error('Error adding user:', err);
      setError(err.message || 'Failed to add user. Please try again.');
    }
  };

  return (
    <div className="container mt-4">
      <h1>User Management</h1>

      {/* Users Table */}
      <div className="mb-3">
        <h2>Users List</h2>
        {loading && <p>Loading users...</p>}
        {error && <div className="alert alert-danger">{error}</div>}
        {success && !showForm && <div className="alert alert-success">User added successfully!</div>}
        {!loading && users.length === 0 && !error && <p>No users found.</p>}
        {!loading && users.length > 0 && (
          <div className="table-responsive">
            <table className="table table-bordered table-striped">
              <thead>
                <tr>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Mobile No.</th>
                  <th>Email Id</th>
                  <th>Employee Id</th>
                  <th>Aadhar No.</th>
                  <th>Team</th>
                  <th>Designation</th>
                  <th>Default Location</th>
                  <th>Status</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.firstName}</td>
                    <td>{user.lastName}</td>
                    <td>{user.mobileNo}</td>
                    <td>{user.emailId}</td>
                    <td>{user.employeeId || '-'}</td>
                    <td>{user.aadharNo || '-'}</td>
                    <td>{user.team}</td>
                    <td>{user.designation}</td>
                    <td>{user.defaultLocation}</td>
                    <td>{user.status}</td>
                    <td>
                      {user.createdAt instanceof Date
                        ? user.createdAt.toLocaleString()
                        : new Date(user.createdAt.seconds * 1000).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Button */}
      {!showForm && (
        <button
          className="btn btn-primary mb-3"
          onClick={() => setShowForm(true)}
        >
          Add User
        </button>
      )}

      {/* Add User Form */}
      {showForm && (
        <div>
          <h2>Add New User</h2>
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="firstName" className="form-label">First Name *</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="lastName" className="form-label">Last Name *</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="mobileNo" className="form-label">Mobile No. *</label>
                <input
                  type="tel"
                  id="mobileNo"
                  name="mobileNo"
                  value={formData.mobileNo}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="emailId" className="form-label">Email Id *</label>
                <input
                  type="email"
                  id="emailId"
                  name="emailId"
                  value={formData.emailId}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="employeeId" className="form-label">Employee Id</label>
                <input
                  type="text"
                  id="employeeId"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="aadharNo" className="form-label">Aadhar No.</label>
                <input
                  type="text"
                  id="aadharNo"
                  name="aadharNo"
                  value={formData.aadharNo}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="team" className="form-label">Team</label>
                <select
                  id="team"
                  name="team"
                  value={formData.team}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="HK">HK</option>
                  <option value="FB">FB</option>
                  <option value="FO">FO</option>
                </select>
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="designation" className="form-label">Designation</label>
                <select
                  id="designation"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="Manager">Manager</option>
                  <option value="Supervisor">Supervisor</option>
                  <option value="Executive">Executive</option>
                  <option value="NMR">NMR</option>
                </select>
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="defaultLocation" className="form-label">Default Location</label>
                <select
                  id="defaultLocation"
                  name="defaultLocation"
                  value={formData.defaultLocation}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="Pearl">Pearl</option>
                  <option value="Wellness">Wellness</option>
                </select>
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="status" className="form-label">Status</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="col-12 mb-3">
                <button type="submit" className="btn btn-primary me-2">Submit</button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default UserManagement;