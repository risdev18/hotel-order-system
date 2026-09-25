import * as admin from 'firebase-admin';

// Initialize with the downloaded JSON file directly for testing
const serviceAccount = require('c:/Users/RISHABH SONAWANE/Downloads/hotel-f469e-firebase-adminsdk-fbsvc-a40f67ccb3.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function test() {
  try {
    const res = await db.collection('test').add({ hello: 'world' });
    console.log("Success! ID:", res.id);
  } catch (err) {
    console.error("Firebase Error:", err);
  }
}

test();
