// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import Login from './Login';
import TransactionRegister from './TransactionRegister';
import './App.css';
import FirestoreTest from './test';
import LogBook from './LogBook';
import 'bootstrap/dist/css/bootstrap.min.css';
import Reports from './Reports';
import FrontOfficeChecklist from './FrontOfficeChecklist';
import HousekeepingChecklist from './HousekeepingChecklist';
import RestaurantChecklist from './RestaurantChecklist';
import { AuthProvider } from './AuthContext'; // Named import
import StaffScore from './StaffScore';
import UserManagement from './UserManagement';

// Protected Route Component
const ProtectedRoute = ({ user, allowedEmails, children, redirectTo = '/' }) => {
  if (!user) {
    return <Navigate to="/" />;
  }
  if (!allowedEmails.includes(user.email)) {
    return <Navigate to={redirectTo} />;
  }
  return children;
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const allowedEmails = [
    'siddhant.gode@volunteer.heartfulness.org',
    'pearl.manager@heartfulness.org',
  ];

  useEffect(() => {
    console.log('Setting up auth state listener in App');
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('Auth state changed:', currentUser);
      setUser(currentUser);
      setLoading(false);
    }, (err) => {
      console.error('Auth state error:', err);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthProvider value={{ user, setUser }}> {/* Ensure this uses the component */}
      <Router>
        <Routes>
          <Route path="/" element={<Login user={user} setUser={setUser} />} />
          <Route
            path="/welcome"
            element={loading ? <div>Loading...</div> : user ? <Login user={user} setUser={setUser} /> : <Navigate to="/" />}
          />
          <Route path="/transaction-register" element={<TransactionRegister />} />
          <Route path="/shift-handover" element={<div>Shift Handover Page</div>} />
          <Route path="/log-book" element={<LogBook />} />
          <Route path="/travel-desk" element={<div>Travel Desk Page</div>} />
          <Route path="/test" element={<FirestoreTest />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/front-office-checklist" element={<FrontOfficeChecklist />} />
          <Route path="/housekeeping-checklist" element={<HousekeepingChecklist />} />
          <Route path="/restaurant-checklist" element={<RestaurantChecklist />} />
          <Route
            path="/staff-score"
            element={
              <ProtectedRoute user={user} allowedEmails={allowedEmails} redirectTo="/front-office-checklist">
                <StaffScore />
              </ProtectedRoute>
            }
          />
          <Route path="/front-office-summary" element={<div>Front Office Summary Page</div>} />
          <Route
            path="/user-management"
            element={
              <ProtectedRoute user={user} allowedEmails={allowedEmails} redirectTo="/welcome">
                <UserManagement />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;