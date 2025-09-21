"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const router = (0, express_1.Router)();
// User Registration
router.post('/register', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Check if user already exists
        const userSnapshot = yield config_1.db.collection('users').where('email', '==', email).get();
        if (!userSnapshot.empty) {
            return res.status(400).send({ message: 'User with that email already exists.' });
        }
        // Hash password
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        // Store user in Firestore
        const newUserRef = yield config_1.db.collection('users').add({
            email,
            password: hashedPassword,
            createdAt: new Date(),
        });
        // Generate JWT (for immediate login after registration)
        const token = jsonwebtoken_1.default.sign({ userId: newUserRef.id }, process.env.JWT_SECRET || 'supersecretkey', { expiresIn: '1h' });
        res.status(201).send({ message: 'User registered successfully', token });
    }
    catch (error) {
        next(error);
    }
}));
// User Login
router.post('/login', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Check if user exists
        const userSnapshot = yield config_1.db.collection('users').where('email', '==', email).get();
        if (userSnapshot.empty) {
            return res.status(400).send({ message: 'Invalid credentials.' });
        }
        const userDoc = userSnapshot.docs[0];
        const user = userDoc.data();
        // Compare passwords
        const isMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send({ message: 'Invalid credentials.' });
        }
        // Generate JWT
        const token = jsonwebtoken_1.default.sign({ userId: userDoc.id }, process.env.JWT_SECRET || 'supersecretkey', { expiresIn: '1h' });
        res.send({ message: 'Logged in successfully', token });
    }
    catch (error) {
        next(error);
    }
}));
exports.default = router;
