import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, onSnapshot } from 'firebase/firestore';

const FirestoreTest = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('useEffect triggered, setting up Firestore listener');

    const unsubscribe = onSnapshot(
      collection(db, 'transactions'),
      (snapshot) => {
        console.log('Snapshot received, number of documents:', snapshot.docs.length);
        const transactionsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log('Fetched transactions:', transactionsData);
        setLoading(false);
      },
      (error) => {
        console.error('Firestore error:', error.code, error.message, error.stack);
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []); // Empty dependency array for one-time setup

  return (
    <div>
      <h2>Firestore Test Component</h2>
      {loading ? <p>Loading data from Firestore...</p> : <p>Data fetched, check console for logs.</p>}
    </div>
  );
};

export default FirestoreTest;