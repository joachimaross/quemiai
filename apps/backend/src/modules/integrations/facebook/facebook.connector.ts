import { Injectable } from '@nestjs/common';
import { ExternalPost } from '../instagram/instagram.connector';

/**
 * Mock Facebook connector
 * TODO: Implement real Facebook Graph API integration
 * See: https://developers.facebook.com/docs/graph-api/
 */
@Injectable()
export class FacebookConnector {
  async fetchPosts(userId: string, accessToken: string): Promise<ExternalPost[]> {
    // Mock implementation - replace with real API calls
    return [
      {
        id: `fb-${Date.now()}-1`,
        content: 'Had a great time at the conference today! 📊',
        platform: 'facebook',
        user: 'John Doe',
        media: ['https://picsum.photos/500/300'],
        timestamp: new Date().toISOString(),
        likes: 89,
        comments: 12,
        shares: 5,
        externalId: 'fb_post_789',
        externalUrl: 'https://facebook.com/user/posts/example',
      },
    ];
  }

  async fetchDirectMessages(userId: string, accessToken: string): Promise<any[]> {
    // Mock implementation
    return [];
  }
}
