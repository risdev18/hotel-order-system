const { loadEnvConfig } = require('@next/env');
const projectDir = process.cwd();
loadEnvConfig(projectDir);
console.log("KEY IS:", process.env.FIREBASE_PRIVATE_KEY ? "EXISTS" : "MISSING");
console.log("LENGTH:", process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.length : 0);
