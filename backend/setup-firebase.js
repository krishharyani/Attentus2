import { firebaseAdmin } from './src/config/firebase.js';

async function setupFirebaseStorage() {
  try {
    console.log('Setting up Firebase Storage...');
    
    const bucket = firebaseAdmin.storage().bucket();
    const bucketName = bucket.name;
    
    console.log('Storage bucket name:', bucketName);
    
    // Check if bucket exists
    const [exists] = await bucket.exists();
    
    if (exists) {
      console.log('✅ Storage bucket already exists');
    } else {
      console.log('❌ Storage bucket does not exist');
      console.log('Please create the bucket manually in Firebase Console:');
      console.log(`1. Go to https://console.firebase.google.com/project/attentus-6c92a/storage`);
      console.log(`2. Click "Get started"`);
      console.log(`3. Choose a location (e.g., us-central1)`);
      console.log(`4. Create the bucket: ${bucketName}`);
    }
    
    // Test bucket access
    try {
      const [files] = await bucket.getFiles({ maxResults: 1 });
      console.log('✅ Bucket access test successful');
    } catch (error) {
      console.log('❌ Bucket access test failed:', error.message);
    }
    
  } catch (error) {
    console.error('Error setting up Firebase Storage:', error);
  }
}

setupFirebaseStorage(); 