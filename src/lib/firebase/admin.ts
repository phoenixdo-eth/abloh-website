import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK
if (!getApps().length) {
  try {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
      : null;

    if (serviceAccount) {
      initializeApp({
        credential: cert(serviceAccount),
      });
    } else {
      console.warn('Firebase Admin not initialized: Missing service account key');
    }
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
  }
}

export const adminDb = getApps().length > 0 ? getFirestore() : null;
