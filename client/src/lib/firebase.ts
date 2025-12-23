import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Using environment variables or placeholders if not set
// In a real scenario, these would be populated via Replit Secrets
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAQEDN0BslmoMDBjrr4Ek-QhXxcRHKwmbg",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "deaf-apk.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "deaf-apk",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "deaf-apk.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "386436896382",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:386436896382:web:36465027b5356d114eea2f",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
