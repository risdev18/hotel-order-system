const { loadEnvConfig } = require('@next/env');
const projectDir = process.cwd();
loadEnvConfig(projectDir);

const json = {
  project_id: process.env.FIREBASE_PROJECT_ID || 'hotel-f469e',
  client_email: process.env.FIREBASE_CLIENT_EMAIL || 'firebase-adminsdk-fbsvc@hotel-f469e.iam.gserviceaccount.com',
  private_key: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/"/g, '').replace(/\\n/g, '\n') : ''
};

console.log("\n--- COPY THE LINE BELOW ---");
console.log(JSON.stringify(json));
console.log("---------------------------\n");
