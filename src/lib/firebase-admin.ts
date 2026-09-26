import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function initDb() {
  if (!getApps().length) {
    const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT;
    let credentialConfig;
    try {
      // Try normal JSON parse first
      if (serviceAccountStr) {
        credentialConfig = cert(JSON.parse(serviceAccountStr));
      } else {
        throw new Error("No serviceAccountStr");
      }
    } catch (e) {
      // Fallback: extract from env
      const privateKeyEnv = process.env.FIREBASE_PRIVATE_KEY;
      
      if (!privateKeyEnv) {
        throw new Error("FIREBASE_PRIVATE_KEY environment variable is completely missing or empty! Please add it to your .env file or Vercel dashboard.");
      }

      // Remove any literal double quotes that might have been parsed, and fix newlines
      const privateKey = privateKeyEnv.replace(/"/g, '').replace(/\\n/g, '\n');
      
      credentialConfig = cert({
        projectId: process.env.FIREBASE_PROJECT_ID || 'hotel-f469e',
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL || 'firebase-adminsdk-fbsvc@hotel-f469e.iam.gserviceaccount.com',
        privateKey: privateKey,
      });
    }
    initializeApp({ credential: credentialConfig });
  }
  return getFirestore();
}

export const db = new Proxy({} as any, {
  get: (target, prop) => {
    const firestore = initDb();
    return (firestore as any)[prop];
  }
});
