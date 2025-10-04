import { InstagramService } from '../instagram';
import axios from 'axios';

/* eslint-disable @typescript-eslint/no-explicit-any */

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('InstagramService', () => {
  let service: InstagramService;

  beforeEach(() => {
    service = new InstagramService();
    jest.clearAllMocks();
  });

  describe('getAuthorizationUrl', () => {
    it('should generate correct authorization URL', () => {
      const state = 'test-state-123';
      const url = service.getAuthorizationUrl(state);

      expect(url).toContain('https://api.instagram.com/oauth/authorize');
      expect(url).toContain('response_type=code');
      expect(url).toContain(`state=${state}`);
      expect(url).toContain('scope=instagram_basic');
    });
  });

  describe('getShortLivedToken', () => {
    it('should exchange code for short-lived token', async () => {
      const mockResponse = {
        data: {
          access_token: 'short-lived-token',
          user_id: 12345,
        },
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await service.getShortLivedToken('auth-code-123');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://api.instagram.com/oauth/access_token',
        expect.objectContaining({
          code: 'auth-code-123',
          grant_type: 'authorization_code',
        }),
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }),
      );

      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getLongLivedToken', () => {
    it('should exchange short-lived token for long-lived token', async () => {
      const mockResponse = {
        data: {
          access_token: 'long-lived-token',
          token_type: 'bearer',
          expires_in: 5184000,
        },
      };

      const mockClient = {
        get: jest.fn().mockResolvedValueOnce(mockResponse),
      };
      (service as any).client = mockClient;

      const result = await service.getLongLivedToken('short-lived-token');

      expect(mockClient.get).toHaveBeenCalledWith(
        '/access_token',
        expect.objectContaining({
          params: expect.objectContaining({
            grant_type: 'ig_exchange_token',
            access_token: 'short-lived-token',
          }),
        }),
      );

      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getUserProfile', () => {
    it('should fetch user profile information', async () => {
      const mockProfile = {
        data: {
          id: 'user-123',
          username: 'testuser',
          account_type: 'BUSINESS',
          media_count: 100,
          followers_count: 5000,
          follows_count: 200,
          name: 'Test User',
          biography: 'Test bio',
          website: 'https://example.com',
          profile_picture_url: 'https://example.com/pic.jpg',
        },
      };

      const mockClient = {
        get: jest.fn().mockResolvedValueOnce(mockProfile),
      };
      (service as any).client = mockClient;

      const result = await service.getUserProfile('access-token', 'user-123');

      expect(mockClient.get).toHaveBeenCalledWith(
        '/user-123',
        expect.objectContaining({
          params: expect.objectContaining({
            access_token: 'access-token',
          }),
        }),
      );

      expect(result).toEqual(mockProfile.data);
    });
  });

  describe('getUserMedia', () => {
    it('should fetch user media/posts', async () => {
      const mockMedia = {
        data: {
          data: [
            {
              id: 'media-1',
              caption: 'Test caption',
              media_type: 'IMAGE',
              media_url: 'https://example.com/image.jpg',
            },
          ],
          paging: {
            cursors: {
              before: 'before-cursor',
              after: 'after-cursor',
            },
          },
        },
      };

      const mockClient = {
        get: jest.fn().mockResolvedValueOnce(mockMedia),
      };
      (service as any).client = mockClient;

      const result = await service.getUserMedia('access-token', 'user-123', 25);

      expect(mockClient.get).toHaveBeenCalledWith(
        '/user-123/media',
        expect.objectContaining({
          params: expect.objectContaining({
            access_token: 'access-token',
            limit: 25,
          }),
        }),
      );

      expect(result).toEqual(mockMedia.data);
    });
  });

  describe('createMediaContainer', () => {
    it('should create a media container for image', async () => {
      const mockResponse = {
        data: {
          id: 'container-123',
        },
      };

      const mockClient = {
        post: jest.fn().mockResolvedValueOnce(mockResponse),
      };
      (service as any).client = mockClient;

      const result = await service.createMediaContainer(
        'access-token',
        'user-123',
        'https://example.com/image.jpg',
        'Test caption',
      );

      expect(mockClient.post).toHaveBeenCalledWith(
        '/user-123/media',
        null,
        expect.objectContaining({
          params: expect.objectContaining({
            image_url: 'https://example.com/image.jpg',
            caption: 'Test caption',
            access_token: 'access-token',
          }),
        }),
      );

      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('publishMedia', () => {
    it('should publish a media container', async () => {
      const mockResponse = {
        data: {
          id: 'published-media-123',
        },
      };

      const mockClient = {
        post: jest.fn().mockResolvedValueOnce(mockResponse),
      };
      (service as any).client = mockClient;

      const result = await service.publishMedia('access-token', 'user-123', 'container-123');

      expect(mockClient.post).toHaveBeenCalledWith(
        '/user-123/media_publish',
        null,
        expect.objectContaining({
          params: expect.objectContaining({
            creation_id: 'container-123',
            access_token: 'access-token',
          }),
        }),
      );

      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('postContent', () => {
    it('should complete full post flow for image', async () => {
      const mockClient = {
        post: jest
          .fn()
          .mockResolvedValueOnce({ data: { id: 'container-123' } })
          .mockResolvedValueOnce({ data: { id: 'published-123' } }),
        get: jest.fn().mockResolvedValueOnce({
          data: {
            id: 'published-123',
            permalink: 'https://instagram.com/p/test',
          },
        }),
      };
      (service as any).client = mockClient;

      const result = await service.postContent(
        'access-token',
        'user-123',
        'https://example.com/image.jpg',
        'Test caption',
        false,
      );

      expect(mockClient.post).toHaveBeenCalledTimes(2);
      expect(mockClient.get).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        id: 'published-123',
        permalink: 'https://instagram.com/p/test',
      });
    });
  });

  describe('refreshLongLivedToken', () => {
    it('should refresh a long-lived token', async () => {
      const mockResponse = {
        data: {
          access_token: 'refreshed-token',
          token_type: 'bearer',
          expires_in: 5184000,
        },
      };

      const mockClient = {
        get: jest.fn().mockResolvedValueOnce(mockResponse),
      };
      (service as any).client = mockClient;

      const result = await service.refreshLongLivedToken('old-token');

      expect(mockClient.get).toHaveBeenCalledWith(
        '/refresh_access_token',
        expect.objectContaining({
          params: expect.objectContaining({
            grant_type: 'ig_refresh_token',
            access_token: 'old-token',
          }),
        }),
      );

      expect(result).toEqual(mockResponse.data);
    });
  });
});
