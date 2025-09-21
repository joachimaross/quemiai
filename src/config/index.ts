import 'dotenv/config';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  // databaseURL: 'https://<DATABASE_NAME>.firebaseio.com'
});

export const auth = admin.auth();
export const db = admin.firestore();

export const config = {
  gcsBucketName: process.env.GCS_BUCKET_NAME || 'your-gcs-bucket-name',
  gcpProjectId: process.env.GCP_PROJECT_ID || 'your-gcp-project-id',
  gcpLocation: process.env.GCP_LOCATION || 'us-central1',
  twitter: {
    appKey: process.env.TWITTER_APP_KEY || '',
    appSecret: process.env.TWITTER_APP_SECRET || '',
    accessToken: process.env.TWITTER_ACCESS_TOKEN || '',
    accessSecret: process.env.TWITTER_ACCESS_SECRET || '',
  },
};
