import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = require('c:/Users/RISHABH SONAWANE/Downloads/hotel-f469e-firebase-adminsdk-fbsvc-a40f67ccb3.json');

try {
  if (!getApps().length) {
    initializeApp({
      credential: cert(serviceAccount)
    });
  }
  const db = getFirestore();
  
  async function test() {
    const res = await db.collection("restaurants").get();
    console.log("Success! Found restaurants:", res.docs.length);
  }
  test();
} catch (e) {
  console.error("Init error", e);
}
