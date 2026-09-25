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
      if (!privateKey) {
        const match = str.match(/-----BEGIN PRIVATE KEY-----[a-zA-Z0-9+/\s\\]+-----END PRIVATE KEY-----/);
        if (match) privateKey = match[0];
      }
      
      let formattedKey = (privateKey || process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
      // If Vercel entirely stripped newlines, reconstruct the PEM format automatically
      if (formattedKey && !formattedKey.includes('\n') && formattedKey.includes('-----BEGIN PRIVATE KEY-----')) {
        const middle = formattedKey.split('-----BEGIN PRIVATE KEY-----')[1].split('-----END PRIVATE KEY-----')[0].replace(/\s/g, '');
        const lines = middle.match(/.{1,64}/g)?.join('\n') || '';
        formattedKey = `-----BEGIN PRIVATE KEY-----\n${lines}\n-----END PRIVATE KEY-----\n`;
      }
      
      credentialConfig = cert({
        projectId: 'hotel-f469e',
        clientEmail: 'firebase-adminsdk-fbsvc@hotel-f469e.iam.gserviceaccount.com',
        privateKey: formattedKey,
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
