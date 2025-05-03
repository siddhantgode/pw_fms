// src/test.js
import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, onSnapshot } from 'firebase/firestore';

const FirestoreTest = () => {
  const [loading, setLoading] = useState(true);
  const [transactionsData, setTransactionsData] = useState([]);

  useEffect(() => {
    console.log('useEffect triggered, setting up Firestore listener');

    const unsubscribe = onSnapshot(
      collection(db, 'transactions'), // This is where we listen to changes in the 'transactions' collection
      (snapshot) => {
        console.log('Snapshot received, number of documents:', snapshot.docs.length);

        const fetchedData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log('Fetched transactions:', fetchedData);
        setTransactionsData(fetchedData); // Store the fetched data in state
        setLoading(false); // Set loading to false when data is fetched
      },
      (error) => {
        console.error('Firestore error:', error.code, error.message, error.stack);
        setLoading(false); // Set loading to false if there's an error
      }
    );

    // Cleanup function to unsubscribe from Firestore listener when the component unmounts
    return () => unsubscribe();
  }, []); // Empty dependency array to ensure this runs only once (on mount)

  return (
    <div>
      <h2>Firestore Test Component</h2>
      {loading ? (
        <p>Loading data from Firestore...</p>
      ) : (
        <div>
          <h3>Fetched Transactions:</h3>
          <ul>
            {transactionsData.map((transaction) => (
              <li key={transaction.id}>
                <strong>ID:</strong> {transaction.id} <br />
                <strong>Amount:</strong> {transaction.amount} <br />
                <strong>Type:</strong> {transaction.type} <br />
                <strong>Date:</strong> {transaction.date} <br />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FirestoreTest;
