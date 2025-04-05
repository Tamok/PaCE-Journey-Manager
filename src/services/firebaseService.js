// src/services/firebaseService.js
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDPMU8P8H5X9eMRnwfmvpR2P6MwW4UPma8",
  authDomain: "pace-journey-manager-ef66a.firebaseapp.com",
  projectId: "pace-journey-manager-ef66a",
  storageBucket: "pace-journey-manager-ef66a.firebasestorage.app",
  messagingSenderId: "256697111896",
  appId: "1:256697111896:web:815b63f48c2f91ca5f012d",
  measurementId: "G-W1MP1BBTSZ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export const observeAuthState = (callback) => onAuthStateChanged(auth, callback);

export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error('Google login failed:', error);
    throw error;
  }
};

export { auth, db };
