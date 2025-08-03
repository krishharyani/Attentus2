import { SpeechClient } from '@google-cloud/speech';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// ensure root .env is loaded
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Use the Firebase Admin SDK service account (full bucket access)
const keyFilename = path.resolve(__dirname, '../../credentials/firebase-admin.json');
export const speechClient = new SpeechClient({ keyFilename });
