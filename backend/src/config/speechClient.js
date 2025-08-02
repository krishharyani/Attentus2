import { SpeechClient } from '@google-cloud/speech';
import dotenv from 'dotenv';

// Load environment variables from root .env
dotenv.config({ path: '../.env' });

export const speechClient = new SpeechClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
});
