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
      // Fallback: extract manually if Vercel mangled the JSON
      const str = serviceAccountStr || '';
      const projectId = (str.match(/"project_id"\s*:\s*"([^"]+)"/) || [])[1];
      const clientEmail = (str.match(/"client_email"\s*:\s*"([^"]+)"/) || [])[1];
      const privateKey = (str.match(/"private_key"\s*:\s*"([^"]+)"/) || [])[1];
      
      credentialConfig = cert({
        projectId: projectId || process.env.FIREBASE_PROJECT_ID,
        clientEmail: clientEmail || process.env.FIREBASE_CLIENT_EMAIL,
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
