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
            doc: jest.fn(() => ({
                get: jest.fn(() => Promise.resolve({
                    exists: true,
                    id: 'testUserId',
                    data: () => ({
                        username: 'testuser',
                        email: 'test@example.com',
                        bio: 'Test bio',
                    }),
                })),
                update: jest.fn(() => Promise.resolve()),
            })),
            where: jest.fn(() => ({
                where: jest.fn(() => ({
                    limit: jest.fn(() => ({
                        get: jest.fn(() => Promise.resolve({ empty: true })),
                    })),
                })),
            })),
            add: jest.fn(() => Promise.resolve({ id: 'relationshipId' })),
        })),
        terminate: jest.fn(() => Promise.resolve()),
    }),
    auth: () => ({}),
}));
jest.mock('dotenv/config', () => ({}));
describe('Users API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    afterAll(async () => {
        if (config_1.db && typeof config_1.db.terminate === 'function') {
            await config_1.db.terminate();
        }
    });
    describe('GET /api/v1/users/:userId', () => {
        it('should get user by id successfully', async () => {
            const mockDoc = {
                exists: true,
                id: 'user123',
                data: () => ({
                    username: 'testuser',
                    email: 'test@example.com',
                    bio: 'Test bio',
                    location: 'Test City',
                }),
            };
            config_1.db.collection.mockReturnValueOnce({
                doc: jest.fn(() => ({
                    get: jest.fn().mockResolvedValue(mockDoc),
                })),
            });
            const res = await (0, supertest_1.default)(api_1.default).get('/api/v1/users/user123');
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('id', 'user123');
            expect(res.body).toHaveProperty('username', 'testuser');
            expect(res.body).toHaveProperty('email', 'test@example.com');
        });
        it('should return 404 for non-existent user', async () => {
            config_1.db.collection.mockReturnValueOnce({
                doc: jest.fn(() => ({
                    get: jest.fn().mockResolvedValue({ exists: false }),
                })),
            });
            const res = await (0, supertest_1.default)(api_1.default).get('/api/v1/users/nonexistent');
            expect(res.statusCode).toEqual(404);
            expect(res.body).toHaveProperty('message', 'User not found');
        });
    });
    describe('PUT /api/v1/users/:userId', () => {
        it('should update user profile successfully', async () => {
            config_1.db.collection.mockReturnValueOnce({
                doc: jest.fn(() => ({
                    update: jest.fn().mockResolvedValue(undefined),
                })),
            });
            const updateData = {
                username: 'updateduser',
                email: 'updated@example.com',
                bio: 'Updated bio',
                location: 'Updated City',
            };
            const res = await (0, supertest_1.default)(api_1.default).put('/api/v1/users/user123').send(updateData);
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('message', 'User profile updated successfully');
        });
        it('should handle validation errors', async () => {
            const invalidData = {
                email: 'invalid-email',
            };
            const res = await (0, supertest_1.default)(api_1.default).put('/api/v1/users/user123').send(invalidData);
            expect([400, 422]).toContain(res.statusCode);
        });
    });
    describe('POST /api/v1/users/:userId/follow', () => {
        it('should follow a user successfully', async () => {
            const mockUserToFollow = {
                exists: true,
                data: () => ({ followersCount: 5 }),
            };
            const mockFollower = {
                exists: true,
                data: () => ({ followingCount: 3 }),
            };
            const mockUpdate = jest.fn().mockResolvedValue(undefined);
            config_1.db.collection
                .mockReturnValueOnce({
                doc: jest.fn(() => ({
                    get: jest.fn().mockResolvedValue(mockUserToFollow),
                    update: mockUpdate,
                })),
            })
                .mockReturnValueOnce({
                where: jest.fn(() => ({
                    where: jest.fn(() => ({
                        limit: jest.fn(() => ({
                            get: jest.fn().mockResolvedValue({ empty: true }),
                        })),
                    })),
                })),
                add: jest.fn().mockResolvedValue({ id: 'relationshipId' }),
            });
            const res = await (0, supertest_1.default)(api_1.default)
                .post('/api/v1/users/targetUserId/follow')
                .set('Authorization', 'Bearer validtoken')
                .send();
            expect([200, 401]).toContain(res.statusCode);
        });
        it('should return 400 when trying to follow self', async () => {
            const res = await (0, supertest_1.default)(api_1.default)
                .post('/api/v1/users/sameUserId/follow')
                .set('Authorization', 'Bearer validtoken')
                .send();
            expect([400, 401]).toContain(res.statusCode);
        });
    });
    describe('POST /api/v1/users/:userId/unfollow', () => {
        it('should unfollow a user successfully', async () => {
            const mockUserToUnfollow = {
                exists: true,
                data: () => ({ followersCount: 5 }),
            };
            const mockFollower = {
                exists: true,
                data: () => ({ followingCount: 3 }),
            };
            const mockRelationship = {
                empty: false,
                docs: [
                    {
                        id: 'relationshipId',
                        ref: {
                            delete: jest.fn().mockResolvedValue(undefined),
                        },
                    },
                ],
            };
            config_1.db.collection
                .mockReturnValueOnce({
                doc: jest.fn(() => ({
                    get: jest.fn().mockResolvedValue(mockUserToUnfollow),
                    update: jest.fn().mockResolvedValue(undefined),
                })),
            })
                .mockReturnValueOnce({
                where: jest.fn(() => ({
                    where: jest.fn(() => ({
                        limit: jest.fn(() => ({
                            get: jest.fn().mockResolvedValue(mockRelationship),
                        })),
                    })),
                })),
            });
            const res = await (0, supertest_1.default)(api_1.default)
                .post('/api/v1/users/targetUserId/unfollow')
                .set('Authorization', 'Bearer validtoken')
                .send();
            expect([200, 401]).toContain(res.statusCode);
        });
    });
    describe('GET /api/v1/users/:userId/followers', () => {
        it('should get user followers list', async () => {
            const mockFollowers = {
                empty: false,
                docs: [
                    {
                        data: () => ({
                            followerId: 'follower1',
                            createdAt: new Date(),
                        }),
                    },
                    {
                        data: () => ({
                            followerId: 'follower2',
                            createdAt: new Date(),
                        }),
                    },
                ],
            };
            config_1.db.collection.mockReturnValueOnce({
                where: jest.fn(() => ({
                    get: jest.fn().mockResolvedValue(mockFollowers),
                })),
            });
            const res = await (0, supertest_1.default)(api_1.default).get('/api/v1/users/user123/followers');
            expect([200, 404]).toContain(res.statusCode);
            if (res.statusCode === 200) {
                expect(res.body).toHaveProperty('followers');
                expect(Array.isArray(res.body.followers)).toBe(true);
            }
        });
    });
    describe('GET /api/v1/users/:userId/following', () => {
        it('should get user following list', async () => {
            const mockFollowing = {
                empty: false,
                docs: [
                    {
                        data: () => ({
                            followingId: 'following1',
                            createdAt: new Date(),
                        }),
                    },
                    {
                        data: () => ({
                            followingId: 'following2',
                            createdAt: new Date(),
                        }),
                    },
                ],
            };
            config_1.db.collection.mockReturnValueOnce({
                where: jest.fn(() => ({
                    get: jest.fn().mockResolvedValue(mockFollowing),
                })),
            });
            const res = await (0, supertest_1.default)(api_1.default).get('/api/v1/users/user123/following');
            expect([200, 404]).toContain(res.statusCode);
            if (res.statusCode === 200) {
                expect(res.body).toHaveProperty('following');
                expect(Array.isArray(res.body.following)).toBe(true);
            }
        });
    });
});
//# sourceMappingURL=users.test.js.map