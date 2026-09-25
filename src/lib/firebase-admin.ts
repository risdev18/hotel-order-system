import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (!getApps().length) {
  let credentialConfig;
  try {
    credentialConfig = cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}'));
  } catch (e) {
    // Fallback if they used the 3 individual variables
    credentialConfig = cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    });
  }

  initializeApp({
    credential: credentialConfig,
  });
}

const db = getFirestore();
export { db };
