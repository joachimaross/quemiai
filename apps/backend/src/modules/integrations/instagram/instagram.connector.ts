import { Injectable } from '@nestjs/common';

export interface ExternalPost {
  id: string;
  content: string;
  platform: 'instagram' | 'tiktok' | 'facebook' | 'x';
  user: string;
  media?: string[];
  timestamp: string;
  likes?: number;
  comments?: number;
  shares?: number;
  externalId?: string;
  externalUrl?: string;
}

/**
 * Mock Instagram connector
 * TODO: Implement real Instagram Graph API integration
 * See: https://developers.facebook.com/docs/instagram-api/
 */
@Injectable()
export class InstagramConnector {
  async fetchPosts(userId: string, accessToken: string): Promise<ExternalPost[]> {
    // Mock implementation - replace with real API calls
    return [
      {
        id: `ig-${Date.now()}-1`,
        content: 'Beautiful sunset at the beach! 🌅 #travel #sunset',
        platform: 'instagram',
        user: '@johndoe',
        media: ['https://picsum.photos/400/400'],
        timestamp: new Date().toISOString(),
        likes: 1234,
        comments: 56,
        shares: 12,
        externalId: 'ig_post_123',
        externalUrl: 'https://instagram.com/p/example',
      },
    ];
  }

  async fetchDirectMessages(userId: string, accessToken: string): Promise<any[]> {
    // Mock implementation
    return [];
  }
}
