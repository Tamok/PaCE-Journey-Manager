// firebase-config.js
// Initialize Firebase with your project's config details.
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase app
firebase.initializeApp(firebaseConfig);

// Initialize Firestore
const dbFirestore = firebase.firestore();

console.log("Firebase initialized with project:", firebaseConfig.projectId);
