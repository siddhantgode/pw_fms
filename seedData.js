const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');
const fs = require('fs');

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCob6k3QmfUSkYCbnDqBTgy4i7zB2POUMg",
  authDomain: "team-pearl-6f192.firebaseapp.com",
  projectId: "team-pearl-6f192",
  storageBucket: "team-pearl-6f192.firebasestorage.app",
  messagingSenderId: "798707590460",
  appId: "1:798707590460:web:4f9aa0f95e6e1b44e8ea39"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Read JSON file
const jsonData = JSON.parse(fs.readFileSync('dummyData.json', 'utf8'));

// Function to seed data
async function seedData() {
  try {
    for (const item of jsonData) {
      await addDoc(collection(db, 'transactions'), item);
      console.log(`Added document: ${JSON.stringify(item)}`);
    }
    console.log('Data seeding completed successfully');
  } catch (error) {
    console.error('Error seeding data:', error.message);
  }
}

// Run the seeding function
seedData();