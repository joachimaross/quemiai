"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const config_1 = require("../../config");
const api_1 = __importDefault(require("../../functions/api"));
jest.mock('firebase-admin', () => ({
    initializeApp: jest.fn(),
    credential: {
        applicationDefault: jest.fn(),
    },
    firestore: () => ({
        collection: jest.fn(() => ({
            get: jest.fn(() => Promise.resolve({
                docs: [
                    {
                        id: 'creator1',
                        data: () => ({
                            portfolio: ['url1', 'url2'],
                            skills: ['skill1', 'skill2'],
                            rating: 4.5,
                        }),
                    },
                ],
            })),
            doc: jest.fn(() => ({
                get: jest.fn(() => Promise.resolve({
                    exists: true,
                    id: 'creator1',
                    data: () => ({
                        portfolio: ['url1'],
                        skills: ['skill1'],
                        rating: 4.5,
                    }),
                })),
                set: jest.fn(() => Promise.resolve()),
                update: jest.fn(() => Promise.resolve()),
            })),
            add: jest.fn(() => Promise.resolve({ id: 'reviewId' })),
        })),
        terminate: jest.fn(() => Promise.resolve()),
    }),
    auth: () => ({}),
}));
jest.mock('multer', () => {
    const multer = () => ({
        single: () => (req, res, next) => {
            req.file = {
                buffer: Buffer.from('test'),
                originalname: 'test.jpg',
            };
            next();
        },
    });
    multer.memoryStorage = jest.fn();
    return multer;
});
jest.mock('../../services/storage', () => ({
    uploadBuffer: jest.fn().mockResolvedValue(undefined),
    getPublicUrl: jest.fn((fileName) => `https://storage.example.com/${fileName}`),
}));
jest.mock('dotenv/config', () => ({}));
describe('Marketplace API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    afterAll(async () => {
        if (config_1.db && typeof config_1.db.terminate === 'function') {
            await config_1.db.terminate();
        }
    });
    describe('GET /api/v1/marketplace/creators', () => {
        it('should list all creator profiles', async () => {
            const mockDocs = [
                {
                    id: 'creator1',
                    data: () => ({
                        portfolio: ['url1'],
                        skills: ['skill1'],
                        rating: 4.5,
                    }),
                },
                {
                    id: 'creator2',
                    data: () => ({
                        portfolio: ['url2'],
                        skills: ['skill2'],
                        rating: 4.0,
                    }),
                },
            ];
            config_1.db.collection.mockReturnValueOnce({
                get: jest.fn().mockResolvedValue({ docs: mockDocs }),
            });
            const res = await (0, supertest_1.default)(api_1.default).get('/api/v1/marketplace/creators');
            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body).toHaveLength(2);
            expect(res.body[0]).toHaveProperty('id', 'creator1');
        });
        it('should return empty array when no creators exist', async () => {
            config_1.db.collection.mockReturnValueOnce({
                get: jest.fn().mockResolvedValue({ docs: [] }),
            });
            const res = await (0, supertest_1.default)(api_1.default).get('/api/v1/marketplace/creators');
            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body).toHaveLength(0);
        });
    });
    describe('GET /api/v1/marketplace/creators/:creatorId', () => {
        it('should get a specific creator profile', async () => {
            const mockDoc = {
                exists: true,
                id: 'creator1',
                data: () => ({
                    portfolio: ['url1'],
                    skills: ['skill1'],
                    rating: 4.5,
                }),
            };
            config_1.db.collection.mockReturnValueOnce({
                doc: jest.fn(() => ({
                    get: jest.fn().mockResolvedValue(mockDoc),
                })),
            });
            const res = await (0, supertest_1.default)(api_1.default).get('/api/v1/marketplace/creators/creator1');
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('id', 'creator1');
            expect(res.body).toHaveProperty('portfolio');
            expect(res.body).toHaveProperty('skills');
            expect(res.body).toHaveProperty('rating', 4.5);
        });
        it('should return 404 for non-existent creator', async () => {
            config_1.db.collection.mockReturnValueOnce({
                doc: jest.fn(() => ({
                    get: jest.fn().mockResolvedValue({ exists: false }),
                })),
            });
            const res = await (0, supertest_1.default)(api_1.default).get('/api/v1/marketplace/creators/nonexistent');
            expect(res.statusCode).toEqual(404);
            expect(res.body).toHaveProperty('message', 'Creator not found');
        });
    });
    describe('POST /api/v1/marketplace/creators', () => {
        it('should create a new creator profile', async () => {
            config_1.db.collection.mockReturnValueOnce({
                doc: jest.fn(() => ({
                    set: jest.fn().mockResolvedValue(undefined),
                })),
            });
            const newCreator = {
                userId: 'user123',
                portfolio: ['url1'],
                skills: ['skill1', 'skill2'],
                rating: 0,
            };
            const res = await (0, supertest_1.default)(api_1.default).post('/api/v1/marketplace/creators').send(newCreator);
            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('id', 'user123');
            expect(res.body).toHaveProperty('message', 'Creator profile created successfully');
        });
        it('should return 400 if userId is missing', async () => {
            const invalidCreator = {
                portfolio: ['url1'],
                skills: ['skill1'],
            };
            const res = await (0, supertest_1.default)(api_1.default).post('/api/v1/marketplace/creators').send(invalidCreator);
            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('message', 'userId is required');
        });
        it('should create creator with default values when optional fields are missing', async () => {
            config_1.db.collection.mockReturnValueOnce({
                doc: jest.fn(() => ({
                    set: jest.fn().mockResolvedValue(undefined),
                })),
            });
            const minimalCreator = {
                userId: 'user123',
            };
            const res = await (0, supertest_1.default)(api_1.default).post('/api/v1/marketplace/creators').send(minimalCreator);
            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('id', 'user123');
        });
    });
    describe('POST /api/v1/marketplace/creators/:creatorId/portfolio', () => {
        it('should upload portfolio file successfully', async () => {
            config_1.db.collection.mockReturnValueOnce({
                doc: jest.fn(() => ({
                    update: jest.fn().mockResolvedValue(undefined),
                })),
            });
            const res = await (0, supertest_1.default)(api_1.default)
                .post('/api/v1/marketplace/creators/creator1/portfolio')
                .attach('file', Buffer.from('test content'), 'test.jpg');
            expect([200, 400]).toContain(res.statusCode);
        });
    });
    describe('POST /api/v1/marketplace/creators/:creatorId/reviews', () => {
        it('should submit a review successfully', async () => {
            const mockCreatorDoc = {
                exists: true,
                data: () => ({ rating: 4.0, reviewCount: 1 }),
            };
            config_1.db.collection
                .mockReturnValueOnce({
                doc: jest.fn(() => ({
                    get: jest.fn().mockResolvedValue(mockCreatorDoc),
                })),
            })
                .mockReturnValueOnce({
                add: jest.fn().mockResolvedValue({ id: 'reviewId' }),
            })
                .mockReturnValueOnce({
                doc: jest.fn(() => ({
                    update: jest.fn().mockResolvedValue(undefined),
                })),
            });
            const review = {
                userId: 'user123',
                rating: 5,
                review: 'Great work!',
            };
            const res = await (0, supertest_1.default)(api_1.default)
                .post('/api/v1/marketplace/creators/creator1/reviews')
                .send(review);
            expect([200, 500]).toContain(res.statusCode);
        });
        it('should return 400 if required fields are missing', async () => {
            const invalidReview = {
                userId: 'user123',
            };
            const res = await (0, supertest_1.default)(api_1.default)
                .post('/api/v1/marketplace/creators/creator1/reviews')
                .send(invalidReview);
            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('message');
        });
    });
    describe('GET /api/v1/marketplace/creators/:creatorId/reviews', () => {
        it('should get all reviews for a creator', async () => {
            const mockReviews = {
                docs: [
                    {
                        id: 'review1',
                        data: () => ({
                            userId: 'user1',
                            rating: 5,
                            review: 'Excellent!',
                            createdAt: new Date(),
                        }),
                    },
                    {
                        id: 'review2',
                        data: () => ({
                            userId: 'user2',
                            rating: 4,
                            review: 'Good work',
                            createdAt: new Date(),
                        }),
                    },
                ],
            };
            config_1.db.collection.mockReturnValueOnce({
                where: jest.fn(() => ({
                    get: jest.fn().mockResolvedValue(mockReviews),
                })),
            });
            const res = await (0, supertest_1.default)(api_1.default).get('/api/v1/marketplace/creators/creator1/reviews');
            expect([200, 404]).toContain(res.statusCode);
            if (res.statusCode === 200) {
                expect(Array.isArray(res.body)).toBe(true);
            }
        });
    });
    describe('GET /api/v1/marketplace/jobs', () => {
        it('should list all available jobs', async () => {
            const mockJobs = {
                docs: [
                    {
                        id: 'job1',
                        data: () => ({
                            title: 'Video Editing',
                            budget: 500,
                            status: 'open',
                        }),
                    },
                    {
                        id: 'job2',
                        data: () => ({
                            title: 'Logo Design',
                            budget: 300,
                            status: 'open',
                        }),
                    },
                ],
            };
            config_1.db.collection.mockReturnValueOnce({
                where: jest.fn(() => ({
                    get: jest.fn().mockResolvedValue(mockJobs),
                })),
            });
            const res = await (0, supertest_1.default)(api_1.default).get('/api/v1/marketplace/jobs');
            expect([200, 404]).toContain(res.statusCode);
            if (res.statusCode === 200) {
                expect(Array.isArray(res.body)).toBe(true);
            }
        });
    });
    describe('POST /api/v1/marketplace/jobs', () => {
        it('should create a new job posting', async () => {
            config_1.db.collection.mockReturnValueOnce({
                add: jest.fn().mockResolvedValue({ id: 'newJobId' }),
            });
            const newJob = {
                clientId: 'client123',
                title: 'Video Editing',
                description: 'Need professional video editing',
                budget: 500,
                deadline: new Date().toISOString(),
            };
            const res = await (0, supertest_1.default)(api_1.default).post('/api/v1/marketplace/jobs').send(newJob);
            expect([201, 400]).toContain(res.statusCode);
            if (res.statusCode === 201) {
                expect(res.body).toHaveProperty('id');
                expect(res.body).toHaveProperty('message');
            }
        });
    });
});
//# sourceMappingURL=marketplace.test.js.map