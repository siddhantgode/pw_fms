// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { AuthProvider } from './AuthContext';
import Login from './auth/Login';
import TransactionRegister from './transactions/TransactionRegister';
import LogBook from './logbook/LogBook';
import Reports from './reports/Reports';
import FoScoreSummary from './reports/FOScoreSummary';
import FrontOfficeChecklist from './checklists/FrontOfficeChecklist';
import HousekeepingChecklist from './checklists/HousekeepingChecklist';
import RestaurantChecklist from './checklists/RestaurantChecklist';
import StaffScore from './staff/StaffScore';
import UserManagement from './staff/UserManagement';

import { AppNavbar } from './ui';
import './App.css';
import FirestoreTest from './test';

// Protected Route Component
const ProtectedRoute = ({ user, allowedEmails, children, redirectTo = '/' }) => {
  if (!user) {
    return <Navigate to="/" />;
  }
  // Allow all users if allowedEmails is ['*']
  if (allowedEmails && allowedEmails[0] !== '*' && !allowedEmails.includes(user.email)) {
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
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        console.log('Auth state changed:', currentUser);
        setUser(currentUser);
        setLoading(false);
      },
      (err) => {
        console.error('Auth state error:', err);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  return (
    <AuthProvider value={{ user, setUser }}>
      <Router>
        {/* Always show navbar at the top */}
        <AppNavbar user={user} setUser={setUser} />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Login user={user} setUser={setUser} />} />
            <Route
              path="/welcome"
              element={
                loading ? (
                  <div>Loading...</div>
                ) : user ? (
                  <Login user={user} setUser={setUser} />
                ) : (
                  <Navigate to="/" />
                )
              }
            />
            {/* All routes below are protected */}
            <Route
              path="/transaction-register"
              element={
                <ProtectedRoute user={user} allowedEmails={['*']}>
                  <TransactionRegister />
                </ProtectedRoute>
              }
            />
            <Route
              path="/shift-handover"
              element={
                <ProtectedRoute user={user} allowedEmails={['*']}>
                  <div>Shift Handover Page</div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/log-book"
              element={
                <ProtectedRoute user={user} allowedEmails={['*']}>
                  <LogBook />
                </ProtectedRoute>
              }
            />
            <Route
              path="/travel-desk"
              element={
                <ProtectedRoute user={user} allowedEmails={['*']}>
                  <div>Travel Desk Page</div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/test"
              element={
                <ProtectedRoute user={user} allowedEmails={['*']}>
                  <FirestoreTest />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute user={user} allowedEmails={['*']}>
                  <Reports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/front-office-checklist"
              element={
                <ProtectedRoute user={user} allowedEmails={['*']}>
                  <FrontOfficeChecklist />
                </ProtectedRoute>
              }
            />
            <Route
              path="/housekeeping-checklist"
              element={
                <ProtectedRoute user={user} allowedEmails={['*']}>
                  <HousekeepingChecklist />
                </ProtectedRoute>
              }
            />
            <Route
              path="/restaurant-checklist"
              element={
                <ProtectedRoute user={user} allowedEmails={['*']}>
                  <RestaurantChecklist />
                </ProtectedRoute>
              }
            />
            <Route
              path="/summary"
              element={
                <ProtectedRoute user={user} allowedEmails={['*']}>
                  <FoScoreSummary />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff-score"
              element={
                <ProtectedRoute user={user} allowedEmails={allowedEmails} redirectTo="/front-office-checklist">
                  <StaffScore />
                </ProtectedRoute>
              }
            />
            <Route
              path="/front-office-summary"
              element={
                <ProtectedRoute user={user} allowedEmails={['*']}>
                  <div>Front Office Summary Page</div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/user-management"
              element={
                <ProtectedRoute user={user} allowedEmails={allowedEmails} redirectTo="/welcome">
                  <UserManagement />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;