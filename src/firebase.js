// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCob6k3QmfUSkYCbnDqBTgy4i7zB2POUMg",
  authDomain: "team-pearl-6f192.firebaseapp.com",
  projectId: "team-pearl-6f192",
  storageBucket: "team-pearl-6f192.firebasestorage.app",
  messagingSenderId: "798707590460",
  appId: "1:798707590460:web:4f9aa0f95e6e1b44e8ea39"
};

const app = initializeApp(firebaseConfig);

// Authentication exports
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Firestore export (no emulator)
const db = getFirestore(app);

export { auth, provider, db };