// src/lib/firebase.ts
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig } from './firebaseConfig'; // Your Firebase config

let app: FirebaseApp;
let db: Firestore;

if (!getApps().length) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log("Firebase initialized successfully");
  } catch (error) {
    console.error("Firebase initialization error:", error);
    // Fallback or error handling
    // For critical errors, you might want to prevent app load or show an error message
    // For now, db might be undefined if initialization fails.
    // Ensure your components handle db being potentially undefined if you don't throw here.
    throw new Error("Firebase initialization failed. Please check your firebaseConfig.ts");
  }
} else {
  app = getApps()[0];
  db = getFirestore(app);
}

export { app, db };
