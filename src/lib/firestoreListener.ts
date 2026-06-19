// src/lib/firestoreListener.ts
//
// Thin wrapper around Firestore's onSnapshot that ALWAYS attaches an error
// handler. Without one, the SDK logs "Uncaught Error in snapshot listener"
// straight to console.error — which Next.js promotes to a full-screen dev
// error overlay.
//
// The single most common trigger is the SIGN-OUT race: when the admin signs
// out, Firebase Auth clears the token immediately, but any open onSnapshot
// listeners are only torn down a tick later when React runs effect cleanup.
// In that gap the backend rejects the still-open listen streams with
// `permission-denied`. This is expected and harmless, so we swallow it.
//
// Usage:  const unsub = listen(query(...), (snap) => { ... }, 'dashboard:att');

import {
  onSnapshot,
  type DocumentData,
  type DocumentReference,
  type DocumentSnapshot,
  type FirestoreError,
  type Query,
  type QuerySnapshot,
  type Unsubscribe,
} from 'firebase/firestore';

/**
 * Errors that are an expected part of normal lifecycle (auth transitions,
 * unsubscribe, brief connectivity blips) rather than real bugs.
 */
const BENIGN_CODES = new Set<string>(['permission-denied', 'cancelled']);

/**
 * True when the error is an expected lifecycle event (sign-out teardown,
 * unsubscribe) rather than a real failure. Lets callers with their own
 * onError skip showing a scary UI state during sign-out.
 */
export function isBenignListenerError(err: FirestoreError): boolean {
  return BENIGN_CODES.has(err.code);
}

/**
 * Centralised snapshot-error handler. Keeps genuinely broken queries loud
 * while silencing the noise produced during sign-out / teardown / offline.
 */
export function handleListenerError(err: FirestoreError, context?: string): void {
  const where = context ? ` [${context}]` : '';

  if (BENIGN_CODES.has(err.code)) {
    // Expected when a listener outlives its auth session. Nothing to do.
    if (process.env.NODE_ENV !== 'production') {
      // console.debug is NOT intercepted by the Next.js error overlay.
      console.debug(
        `Firestore listener stopped${where}: ${err.code} (expected during sign-out/offline)`,
      );
    }
    return;
  }

  if (err.code === 'unavailable') {
    // Transient connectivity loss — the SDK retries automatically.
    console.warn(`Firestore listener temporarily unavailable${where}; retrying…`);
    return;
  }

  // Anything else is a real problem worth surfacing.
  console.error(`Firestore listener error${where}:`, err);
}

// ── Overloads so the snapshot type is inferred correctly at the call site ──
export function listen<T = DocumentData>(
  reference: Query<T>,
  onNext: (snapshot: QuerySnapshot<T>) => void,
  context?: string,
): Unsubscribe;
export function listen<T = DocumentData>(
  reference: DocumentReference<T>,
  onNext: (snapshot: DocumentSnapshot<T>) => void,
  context?: string,
): Unsubscribe;
export function listen(
  reference: Query | DocumentReference,
  // Implementation signature for the two overloads above; it must accept both
  // QuerySnapshot and DocumentSnapshot, so `any` is required here (not exposed
  // to callers — they only see the typed overloads).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onNext: (snapshot: any) => void,
  context?: string,
): Unsubscribe {
  return onSnapshot(reference as Query, onNext, (err: FirestoreError) =>
    handleListenerError(err, context),
  );
}
