'use client';

import React, { useMemo } from 'react';
import { initializeFirebase } from './index';
import { FirebaseProvider } from './provider';

/**
 * Client-side wrapper for Firebase initialization and context provision.
 * Although marked as 'use client', this component still executes on the server
 * during initial hydration (SSR).
 */
export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
  // We use useMemo to ensure initialization happens once during the component lifecycle.
  const { app, db, auth } = useMemo(() => initializeFirebase(), []);

  return (
    <FirebaseProvider app={app} db={db} auth={auth}>
      {children}
    </FirebaseProvider>
  );
}
