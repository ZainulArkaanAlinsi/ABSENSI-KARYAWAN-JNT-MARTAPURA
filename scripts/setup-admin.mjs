import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import fs from 'fs';

// log util
const logFile = 'setup-admin.log';
function log(msg) {
  console.log(msg);
  fs.appendFileSync(logFile, msg + '\n');
}

// config sama persis dengan src/lib/firebase.ts
const firebaseConfig = {
  apiKey: 'AIzaSyD8_xQ095GsDSOr_nhONflsPa0qtMnWfkY',
  authDomain: 'admin-absensi-jne-mtp.firebaseapp.com',
  projectId: 'admin-absensi-jne-mtp',
  storageBucket: 'admin-absensi-jne-mtp.firebasestorage.app',
  messagingSenderId: '586449872388',
  appId: '1:586449872388:web:e72ef8330d71be35ce3751',
  measurementId: 'G-19LD1SX6W3',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const adminEmail = 'admin@jnemtp.com';
const adminPassword = '1234567890';

async function setupAdmin() {
  if (fs.existsSync(logFile)) fs.unlinkSync(logFile);
  log('Starting Admin Initialization...');

  try {
    log(`Setting up Auth account for ${adminEmail}...`);
    let user;

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        adminEmail,
        adminPassword,
      );
      user = userCredential.user;
      log(' Auth account created successfully.');
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        log(' Auth account already exists, signing in to update Firestore...');
        const userCredential = await signInWithEmailAndPassword(
          auth,
          adminEmail,
          adminPassword,
        );
        user = userCredential.user;
      } else {
        throw error;
      }
    }

    log('Updating Firestore user document...');
    await setDoc(
      doc(db, 'users', user.uid),
      {
        uid: user.uid,
        email: adminEmail,
        name: 'Central Admin',
        role: 'admin',
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );

    log('Firestore document initialized with admin role.');
    log('\n Admin Initialization Complete!');
    log(`Email: ${adminEmail}`);
    log(`Password: ${adminPassword}`);
    log('\nYou can now log in to the dashboard.');
  } catch (error) {
    log(`Error during initialization: ${error.message}`);
    if (error.code === 'auth/operation-not-allowed') {
      log(
        '\n Tip: Enable Email/Password sign-in in Firebase Console (Authentication > Sign-in method).',
      );
    }
  } finally {
    process.exit();
  }
}

setupAdmin();
