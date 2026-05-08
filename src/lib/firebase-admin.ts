// src/lib/firebase-admin.ts
import * as admin from 'firebase-admin';

const hasCredentials = process.env.FIREBASE_PROJECT_ID && 
                       process.env.FIREBASE_CLIENT_EMAIL && 
                       process.env.FIREBASE_PRIVATE_KEY;

if (!admin.apps.length && hasCredentials) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
      databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.org`,
    });
  } catch (error: any) {
    console.error('Firebase admin initialization error', error.stack);
  }
}

export const adminAuth = hasCredentials ? admin.auth() : null as any;
export const adminDb = hasCredentials ? admin.firestore() : null as any;
export const adminMessaging = hasCredentials ? admin.messaging() : null as any;
