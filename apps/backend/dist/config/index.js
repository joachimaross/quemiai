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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = exports.db = exports.auth = void 0;
require("dotenv/config");
const admin = __importStar(require("firebase-admin"));
admin.initializeApp({
    credential: admin.credential.applicationDefault(),
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
    tiktok: {
        clientKey: process.env.TIKTOK_CLIENT_KEY || '',
        clientSecret: process.env.TIKTOK_CLIENT_SECRET || '',
        redirectUri: process.env.TIKTOK_REDIRECT_URI || '',
    },
    instagram: {
        clientId: process.env.INSTAGRAM_CLIENT_ID || '',
        clientSecret: process.env.INSTAGRAM_CLIENT_SECRET || '',
        accessToken: process.env.INSTAGRAM_ACCESS_TOKEN || '',
        redirectUri: process.env.INSTAGRAM_REDIRECT_URI || '',
    },
    jwtSecret: process.env.JWT_SECRET || 'supersecretkey',
};
//# sourceMappingURL=index.js.map