import fs from 'fs';
import path from 'path';
import admin from 'firebase-admin';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// load root .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// resolve service account JSON
const credPath = path.resolve(__dirname, '../../credentials/firebase-admin.json');
const serviceAccount = JSON.parse(fs.readFileSync(credPath, 'utf8'));

// Use environment variable or fallback to project ID
const storageBucket = process.env.FIREBASE_STORAGE_BUCKET || `${serviceAccount.project_id}.appspot.com`;

console.log('Initializing Firebase with storage bucket:', storageBucket);

// initialize
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: storageBucket
});

// now export and debug
export const firebaseAdmin = admin;
console.log('⚙️ Actual bucket in use:', firebaseAdmin.storage().bucket().name);
