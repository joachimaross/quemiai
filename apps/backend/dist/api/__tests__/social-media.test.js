"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const config_1 = require("../../config");
const api_1 = __importDefault(require("../../functions/api"));
const tiktok_1 = require("../../services/tiktok");
const instagram_1 = require("../../services/instagram");
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
                id: 'testConnectionId',
            })),
            doc: jest.fn(() => ({
                update: jest.fn(() => Promise.resolve()),
            })),
        })),
        terminate: jest.fn(() => Promise.resolve()),
    }),
    auth: () => ({
        verifyIdToken: jest.fn(() => Promise.resolve({
            uid: 'testUserId',
            email: 'test@example.com',
        })),
    }),
}));
jest.mock('firebase-admin/app', () => ({
    initializeApp: jest.fn(),
    cert: jest.fn(),
}));
jest.mock('firebase-admin/auth', () => ({
    getAuth: jest.fn(() => ({
        verifyIdToken: jest.fn(() => Promise.resolve({
            uid: 'testUserId',
            email: 'test@example.com',
        })),
    })),
}));
jest.mock('dotenv/config', () => ({}));
jest.mock('../../services/tiktok');
const mockedTikTokService = tiktok_1.tiktokService;
jest.mock('../../services/instagram');
const mockedInstagramService = instagram_1.instagramService;
describe('Social Media API Integration', () => {
    const authToken = 'test-firebase-token';
    beforeEach(() => {
        jest.clearAllMocks();
    });
    afterAll(async () => {
        if (config_1.db && typeof config_1.db.terminate === 'function') {
            await config_1.db.terminate();
        }
    });
    describe('POST /api/v1/social-media/connect/tiktok', () => {
        it('should connect a TikTok account successfully', async () => {
            const mockTokenData = {
                access_token: 'tiktok-access-token',
                expires_in: 3600,
                refresh_token: 'tiktok-refresh-token',
                token_type: 'Bearer',
            };
            const mockUserInfo = {
                open_id: 'tiktok-user-123',
                union_id: 'tiktok-union-123',
                avatar_url: 'https://example.com/avatar.jpg',
                display_name: 'TikTok User',
                follower_count: 10000,
                following_count: 500,
                likes_count: 50000,
                video_count: 100,
            };
            mockedTikTokService.getAccessToken = jest.fn().mockResolvedValue(mockTokenData);
            mockedTikTokService.getUserInfo = jest.fn().mockResolvedValue(mockUserInfo);
            config_1.db.collection.mockReturnValueOnce({
                where: jest.fn().mockReturnThis(),
                get: jest.fn().mockResolvedValue({ empty: true }),
                add: jest.fn().mockResolvedValue({ id: 'connectionId' }),
            });
            const res = await (0, supertest_1.default)(api_1.default)
                .post('/api/v1/social-media/connect/tiktok')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                code: 'tiktok-auth-code',
            });
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('status', 'success');
            expect(res.body).toHaveProperty('message', 'TikTok account connected successfully');
            expect(res.body.data).toHaveProperty('platform', 'tiktok');
            expect(res.body.data).toHaveProperty('username', 'TikTok User');
        });
        it('should return 400 if code is missing', async () => {
            const res = await (0, supertest_1.default)(api_1.default)
                .post('/api/v1/social-media/connect/tiktok')
                .set('Authorization', `Bearer ${authToken}`)
                .send({});
            expect(res.statusCode).toEqual(400);
        });
    });
    describe('POST /api/v1/social-media/connect/instagram', () => {
        it('should connect an Instagram account successfully', async () => {
            const mockShortToken = {
                access_token: 'short-token',
                user_id: 12345,
            };
            const mockLongToken = {
                access_token: 'long-token',
                token_type: 'bearer',
                expires_in: 5184000,
            };
            const mockUserProfile = {
                id: 'instagram-user-123',
                username: 'instagram_user',
                account_type: 'BUSINESS',
                media_count: 200,
                followers_count: 20000,
                follows_count: 300,
                name: 'Instagram User',
                biography: 'Test bio',
                website: 'https://example.com',
                profile_picture_url: 'https://example.com/pic.jpg',
            };
            mockedInstagramService.getShortLivedToken = jest.fn().mockResolvedValue(mockShortToken);
            mockedInstagramService.getLongLivedToken = jest.fn().mockResolvedValue(mockLongToken);
            mockedInstagramService.getUserProfile = jest.fn().mockResolvedValue(mockUserProfile);
            config_1.db.collection.mockReturnValueOnce({
                where: jest.fn().mockReturnThis(),
                get: jest.fn().mockResolvedValue({ empty: true }),
                add: jest.fn().mockResolvedValue({ id: 'connectionId' }),
            });
            const res = await (0, supertest_1.default)(api_1.default)
                .post('/api/v1/social-media/connect/instagram')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                code: 'instagram-auth-code',
            });
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('status', 'success');
            expect(res.body).toHaveProperty('message', 'Instagram account connected successfully');
            expect(res.body.data).toHaveProperty('platform', 'instagram');
            expect(res.body.data).toHaveProperty('username', 'instagram_user');
        });
    });
    describe('DELETE /api/v1/social-media/disconnect/tiktok', () => {
        it('should disconnect a TikTok account', async () => {
            config_1.db.collection.mockReturnValueOnce({
                where: jest.fn().mockReturnThis(),
                get: jest.fn().mockResolvedValue({
                    empty: false,
                    docs: [
                        {
                            id: 'connection-123',
                            data: () => ({ platform: 'tiktok' }),
                        },
                    ],
                }),
                doc: jest.fn(() => ({
                    update: jest.fn().mockResolvedValue(undefined),
                })),
            });
            const res = await (0, supertest_1.default)(api_1.default)
                .delete('/api/v1/social-media/disconnect/tiktok')
                .set('Authorization', `Bearer ${authToken}`);
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('status', 'success');
            expect(res.body).toHaveProperty('message', 'TikTok account disconnected successfully');
        });
        it('should return 404 if TikTok connection not found', async () => {
            config_1.db.collection.mockReturnValueOnce({
                where: jest.fn().mockReturnThis(),
                get: jest.fn().mockResolvedValue({ empty: true }),
            });
            const res = await (0, supertest_1.default)(api_1.default)
                .delete('/api/v1/social-media/disconnect/tiktok')
                .set('Authorization', `Bearer ${authToken}`);
            expect(res.statusCode).toEqual(404);
        });
    });
    describe('GET /api/v1/social-media/user-data', () => {
        it('should fetch user data from connected platforms', async () => {
            const mockTikTokUserInfo = {
                display_name: 'TikTok User',
                follower_count: 10000,
                following_count: 500,
                likes_count: 50000,
                video_count: 100,
                avatar_url: 'https://example.com/avatar.jpg',
            };
            mockedTikTokService.getUserInfo = jest.fn().mockResolvedValue(mockTikTokUserInfo);
            config_1.db.collection.mockReturnValueOnce({
                where: jest.fn().mockReturnThis(),
                get: jest.fn().mockResolvedValue({
                    empty: false,
                    docs: [
                        {
                            data: () => ({
                                platform: 'tiktok',
                                accessToken: 'token',
                                isActive: true,
                            }),
                        },
                    ],
                }),
            });
            const res = await (0, supertest_1.default)(api_1.default)
                .get('/api/v1/social-media/user-data')
                .set('Authorization', `Bearer ${authToken}`)
                .query({ platforms: 'tiktok' });
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('status', 'success');
            expect(res.body.data).toHaveProperty('tiktok');
        });
    });
    describe('GET /api/v1/social-media/connections', () => {
        it('should return all connected social media accounts', async () => {
            config_1.db.collection.mockReturnValueOnce({
                where: jest.fn().mockReturnThis(),
                get: jest.fn().mockResolvedValue({
                    empty: false,
                    docs: [
                        {
                            id: 'connection-1',
                            data: () => ({
                                platform: 'tiktok',
                                platformUsername: 'tiktok_user',
                                isActive: true,
                                createdAt: '2024-01-01',
                                updatedAt: '2024-01-01',
                            }),
                        },
                        {
                            id: 'connection-2',
                            data: () => ({
                                platform: 'instagram',
                                platformUsername: 'instagram_user',
                                isActive: true,
                                createdAt: '2024-01-01',
                                updatedAt: '2024-01-01',
                            }),
                        },
                    ],
                }),
            });
            const res = await (0, supertest_1.default)(api_1.default)
                .get('/api/v1/social-media/connections')
                .set('Authorization', `Bearer ${authToken}`);
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('status', 'success');
            expect(res.body.data).toHaveLength(2);
            expect(res.body.data[0]).toHaveProperty('platform');
            expect(res.body.data[0]).toHaveProperty('platformUsername');
        });
    });
    describe('POST /api/v1/social-media/post', () => {
        it('should create a post on TikTok', async () => {
            mockedTikTokService.publishVideo = jest.fn().mockResolvedValue({
                publish_id: 'pub-123',
            });
            config_1.db.collection.mockReturnValueOnce({
                where: jest.fn().mockReturnThis(),
                get: jest.fn().mockResolvedValue({
                    empty: false,
                    docs: [
                        {
                            data: () => ({
                                platform: 'tiktok',
                                accessToken: 'token',
                                isActive: true,
                            }),
                        },
                    ],
                }),
            });
            const res = await (0, supertest_1.default)(api_1.default)
                .post('/api/v1/social-media/post')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                platforms: ['tiktok'],
                mediaUrl: 'https://example.com/video.mp4',
                caption: 'Test post',
                isVideo: true,
            });
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('status', 'success');
            expect(res.body.data).toHaveProperty('tiktok');
        });
        it('should return 400 if platforms array is missing', async () => {
            const res = await (0, supertest_1.default)(api_1.default)
                .post('/api/v1/social-media/post')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                mediaUrl: 'https://example.com/video.mp4',
            });
            expect(res.statusCode).toEqual(400);
        });
    });
});
//# sourceMappingURL=social-media.test.js.map