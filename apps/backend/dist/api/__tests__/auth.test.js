"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const config_1 = require("../../config");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const api_1 = __importDefault(require("../../functions/api"));
jest.mock('firebase-admin', () => ({
    initializeApp: jest.fn(),
    credential: {
        applicationDefault: jest.fn(),
    },
    firestore: () => ({
        collection: jest.fn(() => ({
            where: jest.fn(() => ({
                get: jest.fn(() => Promise.resolve({
                    empty: true,
                    docs: [],
                })),
            })),
            add: jest.fn(() => Promise.resolve({
                id: 'testUserId',
            })),
        })),
        terminate: jest.fn(() => Promise.resolve()),
    }),
    auth: () => ({}),
}));
jest.mock('dotenv/config', () => ({}));
describe('Auth API Integration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    afterAll(async () => {
        if (config_1.db && typeof config_1.db.terminate === 'function') {
            await config_1.db.terminate();
        }
    });
    describe('POST /api/v1/auth/register', () => {
        it('should register a new user successfully', async () => {
            config_1.db.collection.mockReturnValueOnce({
                where: jest.fn().mockReturnThis(),
                get: jest.fn().mockResolvedValue({ empty: true }),
                add: jest.fn().mockResolvedValue({ id: 'testUserId' }),
            });
            const res = await (0, supertest_1.default)(api_1.default).post('/api/v1/auth/register').send({
                email: 'test@example.com',
                password: 'password123',
                username: 'testuser',
            });
            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('message', 'User registered successfully');
            expect(res.body).toHaveProperty('token');
        });
        it('should return 400 if user already exists', async () => {
            config_1.db.collection.mockReturnValueOnce({
                where: jest.fn(() => ({
                    get: jest.fn(() => Promise.resolve({
                        empty: false,
                        docs: [{ data: () => ({ email: 'existing@example.com' }) }],
                    })),
                })),
            });
            const res = await (0, supertest_1.default)(api_1.default).post('/api/v1/auth/register').send({
                email: 'existing@example.com',
                password: 'password123',
                username: 'existinguser',
            });
            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('message', 'User with that email already exists.');
        });
        it('should return 400 for invalid input (e.g., short password)', async () => {
            const res = await (0, supertest_1.default)(api_1.default).post('/api/v1/auth/register').send({
                email: 'invalid@example.com',
                password: 'short',
                username: 'invaliduser',
            });
            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('errors');
            expect(res.body.errors[0]).toHaveProperty('msg', 'Password must be at least 6 characters long');
        });
    });
    describe('POST /api/v1/auth/login', () => {
        it('should log in an existing user successfully', async () => {
            const hashedPassword = await bcryptjs_1.default.hash('password123', 10);
            config_1.db.collection.mockReturnValueOnce({
                where: jest.fn(() => ({
                    get: jest.fn(() => Promise.resolve({
                        empty: false,
                        docs: [
                            {
                                id: 'testUserId',
                                data: () => ({
                                    email: 'login@example.com',
                                    password: hashedPassword,
                                }),
                            },
                        ],
                    })),
                })),
            });
            const res = await (0, supertest_1.default)(api_1.default).post('/api/v1/auth/login').send({
                email: 'login@example.com',
                password: 'password123',
            });
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('message', 'Logged in successfully');
            expect(res.body).toHaveProperty('token');
        });
        it('should return 400 for invalid credentials (user not found)', async () => {
            config_1.db.collection.mockReturnValueOnce({
                where: jest.fn(() => ({
                    get: jest.fn(() => Promise.resolve({
                        empty: true,
                    })),
                })),
            });
            const res = await (0, supertest_1.default)(api_1.default).post('/api/v1/auth/login').send({
                email: 'nonexistent@example.com',
                password: 'password123',
            });
            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('message', 'Invalid credentials.');
        });
        it('should return 400 for invalid credentials (wrong password)', async () => {
            const hashedPassword = await bcryptjs_1.default.hash('wrongpassword', 10);
            config_1.db.collection.mockReturnValueOnce({
                where: jest.fn(() => ({
                    get: jest.fn(() => Promise.resolve({
                        empty: false,
                        docs: [
                            {
                                id: 'testUserId',
                                data: () => ({
                                    email: 'wrongpass@example.com',
                                    password: hashedPassword,
                                }),
                            },
                        ],
                    })),
                })),
            });
            const res = await (0, supertest_1.default)(api_1.default).post('/api/v1/auth/login').send({
                email: 'wrongpass@example.com',
                password: 'password123',
            });
            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('message', 'Invalid credentials.');
        });
    });
});
//# sourceMappingURL=auth.test.js.map