"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = exports.db = exports.auth = void 0;
require("dotenv/config");
const admin = __importStar(require("firebase-admin"));
// TODO: For production, consider using Google Secret Manager to securely retrieve credentials.
// admin.initializeApp({
//   credential: admin.credential.applicationDefault(),
// });
// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    // databaseURL: 'https://<DATABASE_NAME>.firebaseio.com'
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
        accessSecret: process.env.TWITTER_ACCESS_SECRET || '',
    },
    jwtSecret: process.env.JWT_SECRET || 'supersecretkey',
};
