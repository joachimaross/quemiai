"use strict";
exports.__esModule = true;
exports.config = exports.db = exports.auth = void 0;
require("dotenv/config");
var admin = require("firebase-admin");
// TODO: For production, consider using Google Secret Manager to securely retrieve credentials.
// admin.initializeApp({
//   credential: admin.credential.applicationDefault(),
// });
// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.applicationDefault()
});
exports.auth = admin.auth();
exports.db = admin.firestore();
exports.config = {
    gcsBucketName: process.env.GCS_BUCKET_NAME || 'your-gcs-bucket-name',
    gcpProjectId: process.env.GCP_PROJECT_ID || 'your-gcp-project-id',
    gcpLocation: process.env.GCP_LOCATION || 'us-central1',
    twitter: {
        appKey: process.env.TWITTER_APP_KEY || '',
        appSecret: process.env.TWITTER_APP_SECRET || '',
        accessToken: process.env.TWITTER_ACCESS_TOKEN || '',
        accessSecret: process.env.TWITTER_ACCESS_SECRET || ''
    },
    jwtSecret: process.env.JWT_SECRET || 'supersecretkey'
};
