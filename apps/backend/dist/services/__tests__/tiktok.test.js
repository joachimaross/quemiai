"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tiktok_1 = require("../tiktok");
const axios_1 = __importDefault(require("axios"));
jest.mock('axios');
const mockedAxios = axios_1.default;
describe('TikTokService', () => {
    let service;
    beforeEach(() => {
        service = new tiktok_1.TikTokService();
        jest.clearAllMocks();
    });
    describe('getAuthorizationUrl', () => {
        it('should generate correct authorization URL', () => {
            const state = 'test-state-123';
            const url = service.getAuthorizationUrl(state);
            expect(url).toContain('https://www.tiktok.com/v2/auth/authorize/');
            expect(url).toContain('response_type=code');
            expect(url).toContain(`state=${state}`);
            expect(url).toContain('scope=user.info.basic');
        });
    });
    describe('getAccessToken', () => {
        it('should exchange code for access token', async () => {
            const mockResponse = {
                data: {
                    access_token: 'mock-access-token',
                    expires_in: 3600,
                    refresh_token: 'mock-refresh-token',
                    token_type: 'Bearer',
                },
            };
            mockedAxios.post.mockResolvedValueOnce(mockResponse);
            const result = await service.getAccessToken('auth-code-123');
            expect(mockedAxios.post).toHaveBeenCalledWith('https://open.tiktokapis.com/v2/oauth/token/', expect.objectContaining({
                code: 'auth-code-123',
                grant_type: 'authorization_code',
            }), expect.objectContaining({
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }));
            expect(result).toEqual(mockResponse.data);
        });
    });
    describe('getUserInfo', () => {
        it('should fetch user information', async () => {
            const mockUserData = {
                data: {
                    data: {
                        user: {
                            open_id: 'user-123',
                            union_id: 'union-123',
                            avatar_url: 'https://example.com/avatar.jpg',
                            display_name: 'Test User',
                            follower_count: 1000,
                            following_count: 500,
                            likes_count: 5000,
                            video_count: 50,
                        },
                    },
                },
            };
            const mockClient = {
                get: jest.fn().mockResolvedValueOnce(mockUserData),
            };
            service.client = mockClient;
            const result = await service.getUserInfo('mock-access-token');
            expect(mockClient.get).toHaveBeenCalledWith('/user/info/', expect.objectContaining({
                headers: {
                    Authorization: 'Bearer mock-access-token',
                },
            }));
            expect(result).toEqual(mockUserData.data.data.user);
        });
    });
    describe('getUserVideos', () => {
        it('should fetch user videos', async () => {
            const mockVideos = {
                data: {
                    data: {
                        videos: [{ id: 'video-1' }, { id: 'video-2' }],
                        cursor: 'next-cursor',
                        has_more: true,
                    },
                },
            };
            const mockClient = {
                get: jest.fn().mockResolvedValueOnce(mockVideos),
            };
            service.client = mockClient;
            const result = await service.getUserVideos('mock-access-token');
            expect(mockClient.get).toHaveBeenCalledWith('/video/list/', expect.objectContaining({
                headers: {
                    Authorization: 'Bearer mock-access-token',
                },
            }));
            expect(result).toEqual(mockVideos.data.data);
        });
        it('should handle pagination with cursor', async () => {
            const mockVideos = {
                data: {
                    data: {
                        videos: [],
                        cursor: 'next-cursor',
                        has_more: false,
                    },
                },
            };
            const mockClient = {
                get: jest.fn().mockResolvedValueOnce(mockVideos),
            };
            service.client = mockClient;
            await service.getUserVideos('mock-access-token', 'existing-cursor', 10);
            expect(mockClient.get).toHaveBeenCalledWith('/video/list/', expect.objectContaining({
                params: expect.objectContaining({
                    cursor: 'existing-cursor',
                    max_count: 10,
                }),
            }));
        });
    });
    describe('publishVideo', () => {
        it('should publish a video', async () => {
            const mockResponse = {
                data: {
                    publish_id: 'pub-123',
                },
            };
            const mockClient = {
                post: jest.fn().mockResolvedValueOnce(mockResponse),
            };
            service.client = mockClient;
            const result = await service.publishVideo('mock-access-token', 'https://example.com/video.mp4', 'Test Video Title', 'Test description');
            expect(mockClient.post).toHaveBeenCalledWith('/post/publish/video/init/', expect.objectContaining({
                post_info: expect.objectContaining({
                    title: 'Test Video Title',
                    description: 'Test description',
                }),
                source_info: expect.objectContaining({
                    video_url: 'https://example.com/video.mp4',
                }),
            }), expect.objectContaining({
                headers: expect.objectContaining({
                    Authorization: 'Bearer mock-access-token',
                }),
            }));
            expect(result).toEqual(mockResponse.data);
        });
    });
    describe('refreshAccessToken', () => {
        it('should refresh access token', async () => {
            const mockResponse = {
                data: {
                    access_token: 'new-access-token',
                    expires_in: 3600,
                    refresh_token: 'new-refresh-token',
                },
            };
            mockedAxios.post.mockResolvedValueOnce(mockResponse);
            const result = await service.refreshAccessToken('old-refresh-token');
            expect(mockedAxios.post).toHaveBeenCalledWith('https://open.tiktokapis.com/v2/oauth/token/', expect.objectContaining({
                grant_type: 'refresh_token',
                refresh_token: 'old-refresh-token',
            }), expect.any(Object));
            expect(result).toEqual(mockResponse.data);
        });
    });
});
//# sourceMappingURL=tiktok.test.js.map