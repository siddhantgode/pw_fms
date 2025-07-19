import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, query, getDocs, serverTimestamp } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faTruck, faStore, faHeadset, faStar } from '@fortawesome/free-solid-svg-icons';
import StaffTable from './StaffTable';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [activeCategory, setActiveCategory] = useState('Staff'); // Default category
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
    category: 'Staff', // New field
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

  // Filter users by active category
  const filteredUsers = users.filter(user => user.category === activeCategory);

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
      if (!formData.firstName || !formData.lastName || !formData.emailId || !formData.mobileNo || !formData.category) {
        throw new Error('First Name, Last Name, Email Id, Mobile No., and Category are required.');
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
        category: 'Staff',
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
      <div style={{ height: 18 }} />
      <div className="row justify-content-center" style={{ gap: '16px', marginBottom: '24px' }}>
        {/*
          { label: 'Staff', icon: faUsers },
          { label: 'Drivers', icon: faTruck },
          { label: 'Vendors', icon: faStore },
          { label: 'Support', icon: faHeadset },
          { label: 'Important', icon: faStar }
        ].map(({ label, icon }) => (
        */}
          { [
          { label: 'Staff', icon: faUsers },
          { label: 'Drivers', icon: faTruck },
          { label: 'Vendors', icon: faStore },
          { label: 'Support', icon: faHeadset },
          { label: 'Important', icon: faStar }
        ].map(({ label, icon }) => {
          return (
            <div
              key={label}
              className={`col-6 col-md-2 mb-2 d-flex justify-content-center`}
              style={{ minWidth: 120 }}
            >
              <div
                className={`tile shadow-sm d-flex flex-row align-items-center justify-content-start`}
                onClick={() => setActiveCategory(label)}
                style={{
                  height: 38,
                  width: 140,
                  borderRadius: 0,
                  border: activeCategory === label ? '2px solid #3d0066' : '1px solid #3d0066',
                  background: activeCategory === label ? '#3d0066' : '#fff',
                  color: activeCategory === label ? '#fff' : '#3d0066',
                  boxShadow: activeCategory === label ? '0 4px 16px rgba(61,0,102,0.10)' : '0 2px 8px rgba(61,0,102,0.04)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  padding: '0 10px',
                  margin: 0,
                  fontWeight: 500,
                  fontSize: 13,
                  letterSpacing: 0.2,
                  outline: activeCategory === label ? '2px solid #3d0066' : 'none',
                  outlineOffset: 0,
                  position: 'relative',
                }}
              >
                <FontAwesomeIcon icon={icon} size="lg" style={{ marginRight: 10, color: activeCategory === label ? '#fff' : '#3d0066', fontSize: 18, transition: 'color 0.2s' }} />
                <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: 0.2 }}>{label}</span>
                {activeCategory === label && (
                  <span style={{
                    position: 'absolute',
                    bottom: 2,
                    left: 10,
                    width: 120,
                    height: 2,
                    borderRadius: 0,
                    background: '#fff',
                    opacity: 0.7,
                    display: 'block',
                  }}></span>
                )}
              </div>
            </div>
          );
        })}
      {/* End of category tiles */}
      </div>
      {activeCategory === 'Staff' && (
        <div className="mb-3 mt-4">
          <StaffTable />
        </div>
      )}
      {activeCategory !== 'Staff' && (
        <div className="mb-3 mt-4">
          <h2>{activeCategory} List</h2>
          {loading && <p>Loading users...</p>}
          {error && <div className="alert alert-danger">{error}</div>}
          {success && !showForm && <div className="alert alert-success">User added successfully!</div>}
          {!loading && filteredUsers.length === 0 && !error && <p>No {activeCategory.toLowerCase()} found.</p>}
          {!loading && filteredUsers.length > 0 && (
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
                  {filteredUsers.map((user) => (
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
      )}
      {showForm && (
        <div>
          <h2>Add New {activeCategory} User</h2>
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
                <label htmlFor="category" className="form-label">Category *</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="Staff">Staff</option>
                  <option value="Drivers">Drivers</option>
                  <option value="Vendors">Vendors</option>
                  <option value="Support">Support</option>
                  <option value="Important">Important</option>
                </select>
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