"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.firebaseAuth = void 0;
exports.getFirebaseApp = getFirebaseApp;
const app_1 = require("firebase-admin/app");
const auth_1 = require("firebase-admin/auth");
let app;
function getFirebaseApp() {
    if (!app) {
        app = (0, app_1.initializeApp)({
            credential: (0, app_1.cert)({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
        });
    }
    return app;
}
const firebaseAuth = () => (0, auth_1.getAuth)(getFirebaseApp());
exports.firebaseAuth = firebaseAuth;
