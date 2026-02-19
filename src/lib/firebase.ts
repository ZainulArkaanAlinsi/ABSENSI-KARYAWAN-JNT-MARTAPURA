import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD8_xQ095GsDSOr_nhONflsPa0qtMnWfkY",
  authDomain: "admin-absensi-jne-mtp.firebaseapp.com",
  projectId: "admin-absensi-jne-mtp",
  storageBucket: "admin-absensi-jne-mtp.firebasestorage.app",
  messagingSenderId: "586449872388",
  appId: "1:586449872388:web:e72ef8330d71be35ce3751",
  measurementId: "G-19LD1SX6W3"
};


// Prevent duplicate initialization in Next.js dev mode
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
