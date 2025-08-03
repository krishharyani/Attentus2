import { firebaseAdmin } from './src/config/firebase.js';

async function createStorageBucket() {
  try {
    console.log('Creating Firebase Storage bucket...');
    
    const projectId = 'attentus-6c92a';
    const bucketName = `${projectId}.appspot.com`;
    
    console.log('Project ID:', projectId);
    console.log('Bucket name:', bucketName);
    
    // Create the bucket
    const [bucket] = await firebaseAdmin.storage().createBucket(bucketName, {
      location: 'us-central1',
      storageClass: 'STANDARD'
    });
    
    console.log('✅ Storage bucket created successfully!');
    console.log('Bucket name:', bucket.name);
    
    // Set public read access for the bucket
    await bucket.makePublic();
    console.log('✅ Bucket set to public read access');
    
    // Test bucket access
    const [files] = await bucket.getFiles({ maxResults: 1 });
    console.log('✅ Bucket access test successful');
    
    console.log('\n🎉 Firebase Storage is now ready!');
    console.log('You can now upload recordings without the 500 error.');
    
  } catch (error) {
    if (error.code === 409) {
      console.log('✅ Storage bucket already exists');
      console.log('Testing bucket access...');
      
      const bucket = firebaseAdmin.storage().bucket();
      const [files] = await bucket.getFiles({ maxResults: 1 });
      console.log('✅ Bucket access test successful');
      console.log('🎉 Firebase Storage is ready!');
    } else {
      console.error('❌ Error creating storage bucket:', error.message);
      console.log('\nManual setup required:');
      console.log('1. Go to: https://console.firebase.google.com/project/attentus-6c92a/storage');
      console.log('2. Click "Get started"');
      console.log('3. Choose location: us-central1');
      console.log('4. Start in test mode');
      console.log('5. Click "Done"');
    }
  }
}

createStorageBucket(); 