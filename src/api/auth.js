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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var express_1 = require("express");
var bcryptjs_1 = require("bcryptjs");
var jsonwebtoken_1 = require("jsonwebtoken");
var config_1 = require("../config");
var validation_1 = require("../middleware/validation");
var AppError_1 = require("../utils/AppError");
var router = (0, express_1.Router)();
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
router.post('/register', (0, validation_1.validate)(validation_1.userValidationRules), function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, email, password, userSnapshot, hashedPassword, newUserRef, token, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 4, , 5]);
                _a = req.body, email = _a.email, password = _a.password;
                return [4 /*yield*/, config_1.db.collection('users').where('email', '==', email).get()];
            case 1:
                userSnapshot = _b.sent();
                if (!userSnapshot.empty) {
                    return [2 /*return*/, next(new AppError_1["default"]('User with that email already exists.', 400))];
                }
                return [4 /*yield*/, bcryptjs_1["default"].hash(password, 10)];
            case 2:
                hashedPassword = _b.sent();
                return [4 /*yield*/, config_1.db.collection('users').add({
                        email: email,
                        password: hashedPassword,
                        createdAt: new Date()
                    })];
            case 3:
                newUserRef = _b.sent();
                token = jsonwebtoken_1["default"].sign({ userId: newUserRef.id }, process.env.JWT_SECRET || 'supersecretkey', {
                    expiresIn: '1h'
                });
                return [2 /*return*/, res.status(201).send({ message: 'User registered successfully', token: token })];
            case 4:
                error_1 = _b.sent();
                return [2 /*return*/, next(error_1)];
            case 5: return [2 /*return*/];
        }
    });
}); });
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
router.post('/login', (0, validation_1.validate)(validation_1.loginValidationRules), function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, email, password, userSnapshot, userDoc, user, isMatch, token, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                _a = req.body, email = _a.email, password = _a.password;
                return [4 /*yield*/, config_1.db.collection('users').where('email', '==', email).get()];
            case 1:
                userSnapshot = _b.sent();
                if (userSnapshot.empty) {
                    return [2 /*return*/, next(new AppError_1["default"]('Invalid credentials.', 400))];
                }
                userDoc = userSnapshot.docs[0];
                user = userDoc.data();
                return [4 /*yield*/, bcryptjs_1["default"].compare(password, user.password)];
            case 2:
                isMatch = _b.sent();
                if (!isMatch) {
                    return [2 /*return*/, next(new AppError_1["default"]('Invalid credentials.', 400))];
                }
                token = jsonwebtoken_1["default"].sign({ userId: userDoc.id }, process.env.JWT_SECRET || 'supersecretkey', {
                    expiresIn: '1h'
                });
                return [2 /*return*/, res.send({ message: 'Logged in successfully', token: token })];
            case 3:
                error_2 = _b.sent();
                return [2 /*return*/, next(error_2)];
            case 4: return [2 /*return*/];
        }
    });
}); });
exports["default"] = router;
