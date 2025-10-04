"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.firebaseAuthMiddleware = firebaseAuthMiddleware;
const firebase_1 = require("../config/firebase");
async function firebaseAuthMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'No token provided' });
        return;
    }
    const idToken = authHeader.split(' ')[1];
    try {
        const decodedToken = await (0, firebase_1.firebaseAuth)().verifyIdToken(idToken);
        req.user = decodedToken;
        return next();
    }
    catch (error) {
        res.status(401).json({ message: 'Invalid or expired token' });
        return;
    }
}
//# sourceMappingURL=firebaseAuth.js.map