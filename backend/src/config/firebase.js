import admin from 'firebase-admin';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables from root .env
dotenv.config({ path: '../.env' });

const serviceAccount = JSON.parse(
  fs.readFileSync(process.env.FIREBASE_ADMIN_CREDENTIALS, 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET
});

export const firebaseAdmin = admin;
