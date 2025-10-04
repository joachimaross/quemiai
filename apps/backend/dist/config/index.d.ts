import 'dotenv/config';
import * as admin from 'firebase-admin';
export declare const auth: import("firebase-admin/auth").Auth;
export declare const db: admin.firestore.Firestore;
export declare const config: {
    gcsBucketName: string;
    gcpProjectId: string;
    gcpLocation: string;
    twitter: {
        appKey: string;
        appSecret: string;
        accessToken: string;
        accessSecret: string;
    };
    tiktok: {
        clientKey: string;
        clientSecret: string;
        redirectUri: string;
    };
    instagram: {
        clientId: string;
        clientSecret: string;
        accessToken: string;
        redirectUri: string;
    };
    jwtSecret: string;
};
