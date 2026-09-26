import { db } from './src/lib/firebase-admin';

async function main() {
  try {
    const col = await db.collection('test').get();
    console.log("Success! size:", col.size);
  } catch (err) {
    console.error("Error:", err);
  }
}
main();
