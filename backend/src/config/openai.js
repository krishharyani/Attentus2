import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables from root .env
dotenv.config({ path: '../.env' });

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});
