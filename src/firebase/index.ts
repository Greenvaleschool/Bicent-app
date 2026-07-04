import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { firebaseConfig } from './config';

/**
 * Initializes Firebase services with high-fidelity error handling for 
 * development environments. Ensures idempotent initialization of Firestore 
 * and Auth services.
 */
export function initializeFirebase() {
  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  
  let db;
  // Initialize Firestore with optimized settings for persistent connectivity
  // only when running in a browser context.
  try {
    if (typeof window !== 'undefined') {
      db = initializeFirestore(app, {
        experimentalForceLongPolling: true,
      });
    } else {
      db = getFirestore(app);
    }
  } catch (e) {
    // Fallback to standard getter if initialization already occurred
    db = getFirestore(app);
  }
  
  const auth = getAuth(app);

  return { app, db, auth };
}

export * from './provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
