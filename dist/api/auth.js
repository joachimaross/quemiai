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
const validation_1 = require("../middleware/validation");
const AppError_1 = __importDefault(require("../utils/AppError"));
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User authentication and authorization
 */
/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 format: password
 *                 minlength: 6
 *                 description: User's password (min 6 characters)
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User registered successfully
 *                 token:
 *                   type: string
 *                   description: JWT authentication token
 *       400:
 *         description: Bad request (e.g., user already exists, invalid input)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User with that email already exists.
 *       500:
 *         description: Server error
 */
// User Registration
router.post('/register', (0, validation_1.validate)(validation_1.userValidationRules), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Check if user already exists
        const userSnapshot = yield config_1.db.collection('users').where('email', '==', email).get();
        if (!userSnapshot.empty) {
            return next(new AppError_1.default('User with that email already exists.', 400));
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
/**
 * @swagger
 * /login:
 *   post:
 *     summary: Log in a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password
 *     responses:
 *       200:
 *         description: Logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logged in successfully
 *                 token:
 *                   type: string
 *                   description: JWT authentication token
 *       400:
 *         description: Bad request (e.g., invalid credentials)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid credentials.
 *       500:
 *         description: Server error
 */
// User Login
router.post('/login', (0, validation_1.validate)(validation_1.loginValidationRules), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Check if user exists
        const userSnapshot = yield config_1.db.collection('users').where('email', '==', email).get();
        if (userSnapshot.empty) {
            return next(new AppError_1.default('Invalid credentials.', 400));
        }
        const userDoc = userSnapshot.docs[0];
        const user = userDoc.data();
        // Compare passwords
        const isMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return next(new AppError_1.default('Invalid credentials.', 400));
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
