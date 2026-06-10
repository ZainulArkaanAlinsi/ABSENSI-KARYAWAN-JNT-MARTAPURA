// src/lib/firestore/settings.ts
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase'; // ← import dari lokasi yang benar
import { handleListenerError, isBenignListenerError } from '@/lib/firestoreListener';
import type { Settings } from '@/types';

// Gunakan ID dokumen yang konsisten dengan file besar (system)
const SETTINGS_DOC_ID = 'system';

export async function getSettings(): Promise<Settings | null> {
  try {
    const docRef = doc(db, 'settings', SETTINGS_DOC_ID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as Settings;
    }
    return null;
  } catch (error) {
    console.error('Error getting settings:', error);
    return null;
  }
}

export async function updateSettings(settings: Settings): Promise<void> {
  try {
    const docRef = doc(db, 'settings', SETTINGS_DOC_ID);
    await setDoc(docRef, settings, { merge: true });
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
}

/**
 * Real-time listener for settings changes.
 * Fires callback immediately with current data, then on every DB change.
 * Used by both Web Admin and Mobile to stay in sync.
 */
export function subscribeToSettings(callback: (settings: Settings | null) => void): () => void {
  const docRef = doc(db, 'settings', SETTINGS_DOC_ID);
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        callback(snap.data() as Settings);
      } else {
        callback(null);
      }
    },
    (error) => {
      handleListenerError(error, 'settings');
      if (!isBenignListenerError(error)) callback(null);
    }
  );
}