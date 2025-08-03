import { Storage } from '@google-cloud/storage';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// Load credentials
const credPath = path.resolve(__dirname, './credentials/firebase-admin.json');
const credentials = JSON.parse(fs.readFileSync(credPath, 'utf8'));

async function createStorageBucket() {
  try {
    console.log('Creating Firebase Storage bucket using Google Cloud Storage API...');
    
    const projectId = 'attentus-6c92a';
    const bucketName = `${projectId}.appspot.com`;
    
    console.log('Project ID:', projectId);
    console.log('Bucket name:', bucketName);
    
    // Initialize Google Cloud Storage
    const storage = new Storage({
      projectId: projectId,
      credentials: credentials
    });
    
    // Check if bucket already exists
    const [exists] = await storage.bucket(bucketName).exists();
    
    if (exists) {
      console.log('✅ Storage bucket already exists');
    } else {
      // Create the bucket
      const [bucket] = await storage.createBucket(bucketName, {
        location: 'us-central1',
        storageClass: 'STANDARD'
      });
      
      console.log('✅ Storage bucket created successfully!');
      console.log('Bucket name:', bucket.name);
    }
    
    // Test bucket access
    const bucket = storage.bucket(bucketName);
    const [files] = await bucket.getFiles({ maxResults: 1 });
    console.log('✅ Bucket access test successful');
    
    console.log('\n🎉 Firebase Storage is now ready!');
    console.log('You can now upload recordings without the 500 error.');
    
  } catch (error) {
    console.error('❌ Error creating storage bucket:', error.message);
    console.log('\nManual setup required:');
    console.log('1. Go to: https://console.firebase.google.com/project/attentus-6c92a/storage');
    console.log('2. Click "Get started"');
    console.log('3. Choose location: us-central1');
    console.log('4. Start in test mode');
    console.log('5. Click "Done"');
  }
}

createStorageBucket(); 