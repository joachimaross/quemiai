"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const validation_1 = require("../middleware/validation");
const AppError_1 = __importDefault(require("../utils/AppError"));
const router = (0, express_1.Router)();
router.post('/register', (0, validation_1.validate)(validation_1.userValidationRules), async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const userSnapshot = await config_1.db.collection('users').where('email', '==', email).get();
        if (!userSnapshot.empty) {
            return next(new AppError_1.default('User with that email already exists.', 400));
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const newUserRef = await config_1.db.collection('users').add({
            email,
            password: hashedPassword,
            createdAt: new Date(),
        });
        const token = jsonwebtoken_1.default.sign({ userId: newUserRef.id }, process.env.JWT_SECRET || 'supersecretkey', {
            expiresIn: '1h',
        });
        return res.status(201).send({ message: 'User registered successfully', token });
    }
    catch (error) {
        return next(error);
    }
});
router.post('/login', (0, validation_1.validate)(validation_1.loginValidationRules), async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const userSnapshot = await config_1.db.collection('users').where('email', '==', email).get();
        if (userSnapshot.empty) {
            return next(new AppError_1.default('Invalid credentials.', 400));
        }
        const userDoc = userSnapshot.docs[0];
        const user = userDoc.data();
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return next(new AppError_1.default('Invalid credentials.', 400));
        }
        const token = jsonwebtoken_1.default.sign({ userId: userDoc.id }, process.env.JWT_SECRET || 'supersecretkey', {
            expiresIn: '1h',
        });
        return res.send({ message: 'Logged in successfully', token });
    }
    catch (error) {
        return next(error);
    }
});
const firebaseAuth_1 = require("../middleware/firebaseAuth");
router.get('/me', firebaseAuth_1.firebaseAuthMiddleware, async (req, res) => {
    res.json({ user: req.user });
});
exports.default = router;
//# sourceMappingURL=auth.js.map