// src/lib/firebase-admin.ts
import * as admin from 'firebase-admin';

// Pakai initialized=true HANYA kalau initializeApp benar-benar sukses.
// Build-time Next.js juga import file ini saat collect page data, jadi
// init harus defensive — kalau env belum diset atau private key invalid,
// jangan crash; biar exports jadi null dan API route check di runtime.
const hasCredentials =
  !!process.env.FIREBASE_PROJECT_ID &&
  !!process.env.FIREBASE_CLIENT_EMAIL &&
  !!process.env.FIREBASE_PRIVATE_KEY;

let initialized = false;

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
    initialized = true;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.warn('[firebase-admin] init skipped:', msg);
  }
} else if (admin.apps.length) {
  initialized = true;
}

export const adminAuth = initialized ? admin.auth() : (null as unknown as admin.auth.Auth);
export const adminDb = initialized
  ? admin.firestore()
  : (null as unknown as admin.firestore.Firestore);
export const adminMessaging = initialized
  ? admin.messaging()
  : (null as unknown as admin.messaging.Messaging);
export const adminInitialized = initialized;
