import 'dotenv/config';
import * as admin from 'firebase-admin';

// TODO: For production, consider using Google Secret Manager to securely retrieve credentials.
// admin.initializeApp({
//   credential: admin.credential.applicationDefault(),
// });

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
  tiktok: {
    clientKey: process.env.TIKTOK_CLIENT_KEY || '',
    clientSecret: process.env.TIKTOK_CLIENT_SECRET || '',
  },
  instagram: {
    clientId: process.env.INSTAGRAM_CLIENT_ID || '',
    clientSecret: process.env.INSTAGRAM_CLIENT_SECRET || '',
    accessToken: process.env.INSTAGRAM_ACCESS_TOKEN || '',
  },
  jwtSecret: process.env.JWT_SECRET || 'supersecretkey',
};
