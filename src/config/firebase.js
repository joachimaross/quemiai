"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.firebaseAuth = void 0;
exports.getFirebaseApp = getFirebaseApp;
var app_1 = require("firebase-admin/app");
var auth_1 = require("firebase-admin/auth");
var app;
function getFirebaseApp() {
    var _a;
    if (!app) {
        app = (0, app_1.initializeApp)({
            credential: (0, app_1.cert)({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: (_a = process.env.FIREBASE_PRIVATE_KEY) === null || _a === void 0 ? void 0 : _a.replace(/\\n/g, '\n'),
            }),
        });
    }
    return app;
}
var firebaseAuth = function () { return (0, auth_1.getAuth)(getFirebaseApp()); };
exports.firebaseAuth = firebaseAuth;
