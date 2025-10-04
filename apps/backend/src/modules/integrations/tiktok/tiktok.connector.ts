import { Injectable } from '@nestjs/common';
import { ExternalPost } from '../instagram/instagram.connector';

/**
 * Mock TikTok connector
 * TODO: Implement real TikTok API integration
 * See: https://developers.tiktok.com/doc/
 */
@Injectable()
export class TikTokConnector {
  async fetchPosts(userId: string, accessToken: string): Promise<ExternalPost[]> {
    // Mock implementation - replace with real API calls
    return [
      {
        id: `tt-${Date.now()}-1`,
        content: 'Check out this awesome dance! 💃 #foryou #dance',
        platform: 'tiktok',
        user: '@tiktokuser',
        media: ['https://picsum.photos/300/400'],
        timestamp: new Date().toISOString(),
        likes: 5678,
        comments: 234,
        shares: 89,
        externalId: 'tt_video_456',
        externalUrl: 'https://tiktok.com/@user/video/example',
      },
    ];
  }

  async fetchDirectMessages(userId: string, accessToken: string): Promise<any[]> {
    // Mock implementation
    return [];
  }
}
