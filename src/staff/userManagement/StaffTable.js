import React, { useEffect, useRef, useState } from 'react';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import StaffForm from './StaffForm';

export default function StaffTable() {
  const [staff, setStaff] = useState([]);
  const [designationMap, setDesignationMap] = useState({});
  const [teamMap, setTeamMap] = useState({});
  const [locationMap, setLocationMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState([
    'firstName', 'lastName', 'dob', 'empId', 'doj', 'teamId', 'designationId', 'primaryLocation', 'address', 'phNumber', 'emailId', 'aadhar', 'status'
  ]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [users, setUsers] = useState([]); // for StaffForm
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });
  const [editUser, setEditUser] = useState(null); // holds user object to edit
  const columnOptions = [
    { value: 'firstName', label: 'First Name' },
    { value: 'lastName', label: 'Last Name' },
    { value: 'dob', label: 'Date of Birth' },
    { value: 'empId', label: 'Employee ID' },
    { value: 'doj', label: 'Date of Joining' },
    { value: 'teamId', label: 'Team' },
    { value: 'designationId', label: 'Designation' },
    { value: 'primaryLocation', label: 'Primary Location' },
    { value: 'address', label: 'Address' },
    { value: 'phNumber', label: 'Phone Number' },
    { value: 'emailId', label: 'Email ID' },
    { value: 'aadhar', label: 'Aadhar' },
    { value: 'status', label: 'Status' },
  ];

  // Fetch users, designations, teams, and locations
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch users
        const usersSnapshot = await getDocs(collection(db, 'users'));
        let staffList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Sort by primaryLocation/primary_location, designationId/designation_id, teamId/team_id, then firstName
        staffList = staffList.sort((a, b) => {
          // Helper to get comparable value (string or number)
          const getVal = (obj, keys) => {
            for (let k of keys) {
              if (obj[k] !== undefined && obj[k] !== null) return obj[k];
            }
            return '';
          };
          const locA = getVal(a, ['primaryLocation', 'primary_location']);
          const locB = getVal(b, ['primaryLocation', 'primary_location']);
          if (locA < locB) return -1;
          if (locA > locB) return 1;

          const desA = getVal(a, ['designationId', 'designation_id']);
          const desB = getVal(b, ['designationId', 'designation_id']);
          if (desA < desB) return -1;
          if (desA > desB) return 1;

          const teamA = getVal(a, ['teamId', 'team_id']);
          const teamB = getVal(b, ['teamId', 'team_id']);
          if (teamA < teamB) return -1;
          if (teamA > teamB) return 1;

          const firstA = getVal(a, ['firstName']);
          const firstB = getVal(b, ['firstName']);
          if (firstA < firstB) return -1;
          if (firstA > firstB) return 1;

          return 0;
        });

        // Fetch personel (designations)
        const personelSnapshot = await getDocs(collection(db, 'personel'));
        const designationMap = {};
        personelSnapshot.docs.forEach(doc => {
          const data = doc.data();
          if (data.designation_id && data.designation) {
            designationMap[data.designation_id] = data.designation;
          }
        });

        // Fetch teams
        const teamsSnapshot = await getDocs(collection(db, 'teams'));
        const teamMap = {};
        teamsSnapshot.docs.forEach(doc => {
          const data = doc.data();
          if (data.team_id && data.team_name) {
            teamMap[data.team_id] = data.team_name;
          }
        });

        // Fetch locations
        const locationsSnapshot = await getDocs(collection(db, 'locations'));
        const locationMap = {};
        locationsSnapshot.docs.forEach(doc => {
          const data = doc.data();
          // Map location_id to the value of the 'location' field (not 'location_name')
          if (data.location_id && data.location) {
            locationMap[data.location_id] = data.location;
          }
        });

        setStaff(staffList);
        setUsers(staffList); // keep users in sync for StaffForm
        setDesignationMap(designationMap);
        setTeamMap(teamMap);
        setLocationMap(locationMap);
      } catch (err) {
        setError('Failed to fetch user or reference data.');
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  // Filtering logic
  const filteredStaff = staff.filter(user => {
    // Team filter
    if (filters.team && filters.team.length > 0) {
      const userTeam = teamMap[user.teamId] || teamMap[user.team_id] || user.teamId || user.team_id || '';
      if (!filters.team.includes(userTeam)) return false;
    }
    // Designation filter
    if (filters.designation && filters.designation.length > 0) {
      const userDes = designationMap[user.designationId] || designationMap[user.designation_id] || user.designationId || user.designation_id || '';
      if (!filters.designation.includes(userDes)) return false;
    }
    // Location filter
    if (filters.primaryLocation && filters.primaryLocation.length > 0) {
      const userLoc = locationMap[user.primaryLocation] || locationMap[user.primary_location] || user.primaryLocation || user.primary_location || '';
      if (!filters.primaryLocation.includes(userLoc)) return false;
    }
    // Status filter
    if (filters.status && filters.status.length > 0) {
      if (!filters.status.includes(user.status)) return false;
    }
    return true;
  });

  // Toast handler to pass to StaffForm
  const showToast = (msg, type = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
  };

  // Add user handler for StaffForm
  const handleUserAdded = (user) => {
    setStaff(prev => [...prev, user]);
    setUsers(prev => [...prev, user]);
    setShowAddUser(false);
  };
  const handleUserDeleted = (id) => {
    setStaff(prev => prev.filter(u => u.id !== id));
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  
  return (
    <div>
      <style>{`
        .staff-table td, .staff-table th {
          padding: 4px 8px !important;
        }
        .staff-table thead th {
          font-size: 13px !important;
          background: #3d0066 !important;
          color: #fff !important;
          text-align: center !important;
          vertical-align: middle !important;
          position: sticky;
          top: 0;
          z-index: 2;
        }
        .staff-table tbody td {
          font-size: 13px;
        }
        .table-responsive {
          max-height: 70vh;
          overflow-y: auto;
        }
      `}</style>
      <h3>User List</h3>
      {/* Add/Edit User buttons */}
      <div className="mb-2" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8 }}>
        <button
          className="btn btn-primary sharp-btn"
          style={{ marginBottom: 0, borderRadius: 0, fontSize: 13, padding: '4px 14px', border: '1px solid #888' }}
          onClick={() => setShowAddUser(true)}
        >Add User</button>
        <button
          className="btn btn-secondary sharp-btn"
          style={{ marginBottom: 0, borderRadius: 0, fontSize: 13, padding: '4px 14px', border: '1px solid #888' }}
          disabled={!editUser}
          onClick={() => setShowAddUser('edit')}
        >Edit User</button>
        <button
          className="btn btn-danger sharp-btn"
          style={{ marginBottom: 0, borderRadius: 0, fontSize: 13, padding: '4px 14px', border: '1px solid #a30000', background: '#a30000', color: '#fff' }}
          disabled={!editUser}
          onClick={() => {
            if (!editUser) return;
            setToast({
              show: true,
              msg: (
                <span>
                  Are you sure you want to delete this user?&nbsp;
                  <button
                    style={{ background: '#a30000', color: '#fff', border: 'none', borderRadius: 0, padding: '2px 10px', marginLeft: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
                    onClick={async (e) => {
                      e.stopPropagation();
                      // Delete from Firestore
                      await import('firebase/firestore').then(async ({ doc, deleteDoc }) => {
                        await deleteDoc(doc(db, 'users', editUser.id));
                      });
                      setStaff(prev => prev.filter(u => u.id !== editUser.id));
                      setUsers(prev => prev.filter(u => u.id !== editUser.id));
                      setEditUser(null);
                      setToast({ show: true, msg: 'User deleted successfully!', type: 'success' });
                    }}
                  >Confirm</button>
                  <button
                    style={{ background: '#fff', color: '#a30000', border: '1px solid #a30000', borderRadius: 0, padding: '2px 10px', marginLeft: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
                    onClick={(e) => { e.stopPropagation(); setToast({ show: false, msg: '', type: 'success' }); }}
                  >Cancel</button>
                </span>
              ),
              type: 'error',
            });
          }}
        >Delete User</button>
      </div>
      {/* Add/Edit User Modal */}
      {(showAddUser || showAddUser === 'edit') && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.25)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 0,
            border: '2px solid #888',
            minWidth: 800,
            maxWidth: 1000,
            width: '90%',
            boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
            padding: 24,
            position: 'relative',
          }}>
            <button
              onClick={() => { setShowAddUser(false); setEditUser(null); }}
              style={{ position: 'absolute', top: 8, right: 12, border: 'none', background: 'none', fontSize: 20, color: '#888', cursor: 'pointer', zIndex: 10 }}
              aria-label="Close"
            >&times;</button>
            <StaffForm
              onUserAdded={handleUserAdded}
              onClose={() => { setShowAddUser(false); setEditUser(null); }}
              showToast={showToast}
              editUser={showAddUser === 'edit' ? editUser : null}
              mode={showAddUser === 'edit' ? 'edit' : 'add'}
            />
          </div>
        </div>
      )}
      {/* Filter row with MultiSelects and Reconfigure Columns button */}
      <div className="mb-2" style={{ display: 'flex', alignItems: 'center', fontSize: 13, margin: 0, padding: 0 }}>
        <div style={{ flex: 1, display: 'flex', gap: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <MultiSelect
              options={Object.values(teamMap)}
              value={filters?.team || []}
              onChange={vals => setFilters(f => ({ ...f, team: vals }))}
              placeholder="All Teams"
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <MultiSelect
              options={Object.values(designationMap)}
              value={filters?.designation || []}
              onChange={vals => setFilters(f => ({ ...f, designation: vals }))}
              placeholder="All Designations"
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <MultiSelect
              options={Object.values(locationMap)}
              value={filters?.primaryLocation || []}
              onChange={vals => setFilters(f => ({ ...f, primaryLocation: vals }))}
              placeholder="All Locations"
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <MultiSelect
              options={[...new Set(staff.map(u => u.status).filter(Boolean))]}
              value={filters?.status || []}
              onChange={vals => setFilters(f => ({ ...f, status: vals }))}
              placeholder="All Status"
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <button
                className="btn btn-secondary mb-0 sharp-btn"
                style={{ width: '100%', borderRadius: 0, fontSize: 13, padding: '4px 10px', border: '1px solid #888', minHeight: 32 }}
                onClick={() => setShowColumnPicker && setShowColumnPicker(true)}
              >Reconfigure Columns</button>
              {typeof showColumnPicker !== 'undefined' && showColumnPicker && (
                <ColumnPicker
                  options={columnOptions}
                  selected={visibleColumns}
                  onChange={setVisibleColumns}
                  onClose={() => setShowColumnPicker(false)}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      {loading && <p>Loading users...</p>}
      {error && <div className="alert alert-danger">{error}</div>}
      {!loading && staff.length === 0 && !error && <p>No users found.</p>}
      {/* Table with clickable staff names */}
      {!loading && staff.length > 0 && (
        <div className="table-responsive">
          <table className="table table-bordered table-striped staff-table">
            <thead>
              <tr>
                {columnOptions.filter(col => visibleColumns.includes(col.value)).map(col => (
                  <th key={col.value}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredStaff.map(user => (
                <tr key={user.id}>
                  {columnOptions.filter(col => visibleColumns.includes(col.value)).map(col => {
                    if (col.value === 'firstName') {
                      return (
                        <td key={col.value} style={{ cursor: 'pointer', color: '#3d0066', textDecoration: 'underline' }}
                          onClick={() => setEditUser(user)}
                        >{user[col.value] || '-'}</td>
                      );
                    }
                    switch (col.value) {
                      case 'teamId':
                        return <td key={col.value}>{teamMap[user.teamId] || teamMap[user.team_id] || user.teamId || user.team_id || '-'}</td>;
                      case 'designationId':
                        return <td key={col.value}>{designationMap[user.designationId] || designationMap[user.designation_id] || user.designationId || user.designation_id || '-'}</td>;
                      case 'primaryLocation':
                        return <td key={col.value}>{locationMap[user.primaryLocation] || locationMap[user.primary_location] || user.primaryLocation || user.primary_location || '-'}</td>;
                      default:
                        return <td key={col.value}>{user[col.value] || '-'}</td>;
                    }
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Toast message - always rendered so it persists after modal closes */}
      {toast.show && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 3000,
          minWidth: 260,
          background: toast.type === 'error' ? '#a30000' : '#3d0066',
          color: '#fff',
          borderRadius: 0, // sharp border
          boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
          padding: '14px 24px',
          fontSize: 15,
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <span style={{ color: '#fff' }}>{toast.msg}</span>
        </div>
      )}
    </div>
  );
}

// MultiSelect component
function MultiSelect({ options, value, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  // Remove 'All ' prefix from placeholder for correct grammar
  const colName = placeholder.replace(/^All /i, '');
  const allSelected = value.length === options.length && options.length > 0;
  const someSelected = value.length > 1 && value.length < options.length;
  const displayText = () => {
    if (allSelected) return `All ${colName}`;
    if (value.length > 1) return `Multiple ${colName}`;
    if (value.length === 1) return value[0];
    return `Select ${colName}`;
  };
  const handleSelectAll = (checked) => {
    if (checked) onChange(options);
    else onChange([]);
  };
  // Close dropdown on click outside
  React.useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);
  return (
    <div
      className="sharp-select"
      ref={containerRef}
      style={{ border: '1px solid #888', borderRadius: 0, background: '#fff', minHeight: 32, padding: 2, position: 'relative', cursor: 'pointer', fontSize: 13, width: '100%' }}
      tabIndex={0}
    >
      <div onClick={() => setOpen(o => !o)} style={{ minHeight: 22, color: value.length === 0 ? '#888' : '#222', userSelect: 'none', fontSize: 13 }}>
        {displayText()}
        <span style={{ float: 'right', fontSize: 11, color: '#888', marginLeft: 8 }}>{open ? '\u25B2' : '\u25BC'}</span>
      </div>
      {open && (
        <div style={{
          position: 'absolute', left: 0, top: '100%', zIndex: 20, background: '#fff', border: '1px solid #888', borderRadius: 0, minWidth: '100%', maxHeight: 120, overflowY: 'auto', marginTop: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.10)', fontSize: 12
        }}>
          <label style={{ display: 'block', fontWeight: 500, marginBottom: 2, padding: '2px 8px', cursor: 'pointer', fontSize: 12 }}>
            <input
              type="checkbox"
              checked={allSelected}
              ref={el => { if (el) el.indeterminate = someSelected; }}
              onChange={e => handleSelectAll(e.target.checked)}
              style={{ marginRight: 6, width: 12, height: 12 }}
            />
            Select All
          </label>
          {options.map(opt => (
            <label key={opt} style={{ display: 'block', fontWeight: 400, marginBottom: 2, padding: '2px 8px', cursor: 'pointer', fontSize: 12 }}>
              <input
                type="checkbox"
                checked={value.includes(opt)}
                onChange={e => {
                  if (e.target.checked) {
                    onChange([...value, opt]);
                  } else {
                    onChange(value.filter(v => v !== opt));
                  }
                }}
                style={{ marginRight: 6, width: 12, height: 12 }}
              />
              {opt}
            </label>
          ))}
          {options.length === 0 && <span style={{ color: '#888', padding: 8 }}>{placeholder}</span>}
        </div>
      )}
    </div>
  );
}

// ColumnPicker component
function ColumnPicker({ options, selected, onChange, onClose }) {
  const [localSelected, setLocalSelected] = useState(selected);
  const [allChecked, setAllChecked] = useState(selected.length === options.length);
  const popupRef = useRef(null);

  useEffect(() => {
    setAllChecked(localSelected.length === options.length);
  }, [localSelected, options.length]);

  // Close popup on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleSelectAll = (checked) => {
    if (checked) setLocalSelected(options.map(opt => opt.value));
    else setLocalSelected([]);
  };

  const handleApply = () => {
    onChange(localSelected);
    onClose();
  };

  const handleCancel = () => {
    setLocalSelected(selected);
    onClose();
  };

  return (
    <div
      ref={popupRef}
      style={{
        position: 'absolute',
        right: 0,
        top: '110%',
        zIndex: 100,
        background: '#fff',
        border: '1px solid #888',
        borderRadius: 0,
        minWidth: 220,
        boxShadow: '0 2px 8px rgba(0,0,0,0.13)',
        fontSize: 13,
        padding: 10,
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 6, fontSize: 13 }}>Select Columns</div>
      <label style={{ display: 'block', fontWeight: 500, marginBottom: 4, padding: '2px 8px', cursor: 'pointer', fontSize: 12 }}>
        <input
          type="checkbox"
          checked={allChecked}
          onChange={e => handleSelectAll(e.target.checked)}
          style={{ marginRight: 6, width: 12, height: 12 }}
        />
        Select All
      </label>
      <div style={{ maxHeight: 180, overflowY: 'auto', marginBottom: 8 }}>
        {options.map(opt => (
          <label key={opt.value} style={{ display: 'block', fontWeight: 400, marginBottom: 2, padding: '2px 8px', cursor: 'pointer', fontSize: 12 }}>
            <input
              type="checkbox"
              checked={localSelected.includes(opt.value)}
              onChange={e => {
                if (e.target.checked) {
                  setLocalSelected([...localSelected, opt.value]);
                } else {
                  setLocalSelected(localSelected.filter(v => v !== opt.value));
                }
              }}
              style={{ marginRight: 6, width: 12, height: 12 }}
            />
            {opt.label}
          </label>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <button
          className="btn btn-sm btn-primary sharp-btn"
          style={{ fontSize: 12, borderRadius: 0, padding: '2px 10px' }}
          onClick={handleApply}
        >Apply</button>
        <button
          className="btn btn-sm btn-secondary sharp-btn"
          style={{ fontSize: 12, borderRadius: 0, padding: '2px 10px' }}
          onClick={handleCancel}
        >Cancel</button>
      </div>
    </div>
  );
}