// config/firebase.js
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ serviceAccountKey.json ফাইল আছে কি?
const serviceAccount = JSON.parse(
  fs.readFileSync(path.join(__dirname, './serviceAccountKey.json'), 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

console.log('✅ Firebase Admin initialized');

export default admin;