// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyD8_xQ095GsDSOr_nhONflsPa0qtMnWfkY',
  authDomain: 'admin-absensi-jne-mtp.firebaseapp.com',
  projectId: 'admin-absensi-jne-mtp',
  storageBucket: 'admin-absensi-jne-mtp.firebasestorage.app',
  messagingSenderId: '586449872388',
  appId: '1:586449872388:web:e72ef8330d71be35ce3751',
  measurementId: 'G-19LD1SX6W3',
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);


