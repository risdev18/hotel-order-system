import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function initDb() {
  if (!getApps().length) {
    const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT;
    let credentialConfig;
    try {
      // Try normal JSON parse first
      credentialConfig = cert(JSON.parse(serviceAccountStr || '{}'));
    } catch (e) {
      // Fallback: extract manually or use hardcoded IDs
      const str = serviceAccountStr || process.env.FIREBASE_PRIVATE_KEY || '';
      
      let privateKey = (str.match(/"private_key"\s*:\s*"([^"]+)"/) || [])[1];
      if (!privateKey && str.includes('-----BEGIN PRIVATE KEY-----')) {
        privateKey = str;
      }
      
      credentialConfig = cert({
        projectId: 'hotel-f469e',
        clientEmail: 'firebase-adminsdk-fbsvc@hotel-f469e.iam.gserviceaccount.com',
        privateKey: (privateKey || process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
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
