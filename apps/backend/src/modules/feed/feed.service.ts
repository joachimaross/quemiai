import { Injectable } from '@nestjs/common';
import { InstagramConnector } from '../integrations/instagram/instagram.connector';
import { TikTokConnector } from '../integrations/tiktok/tiktok.connector';
import { FacebookConnector } from '../integrations/facebook/facebook.connector';
import { XConnector } from '../integrations/x/x.connector';
import { ExternalPost } from '../integrations/instagram/instagram.connector';

export interface UnifiedFeedResponse {
  items: ExternalPost[];
  nextCursor?: string;
  hasMore: boolean;
}

@Injectable()
export class FeedService {
  constructor(
    private instagramConnector: InstagramConnector,
    private tiktokConnector: TikTokConnector,
    private facebookConnector: FacebookConnector,
    private xConnector: XConnector,
  ) {}

  /**
   * Fetches unified feed from all connected platforms
   * Aggregates posts from Instagram, TikTok, Facebook, and X
   */
  async getUnifiedFeed(userId: string, limit = 20): Promise<UnifiedFeedResponse> {
    try {
      // TODO: Fetch user's platform connections from database
      // For now, using mock data
      const connections = await this.getUserConnections(userId);

      // Fetch from all connected platforms in parallel
      const feedPromises: Promise<ExternalPost[]>[] = [];

      for (const connection of connections) {
        switch (connection.platform) {
          case 'instagram':
            feedPromises.push(
              this.instagramConnector.fetchPosts(userId, connection.accessToken),
            );
            break;
          case 'tiktok':
            feedPromises.push(
              this.tiktokConnector.fetchPosts(userId, connection.accessToken),
            );
            break;
          case 'facebook':
            feedPromises.push(
              this.facebookConnector.fetchPosts(userId, connection.accessToken),
            );
            break;
          case 'x':
            feedPromises.push(
              this.xConnector.fetchPosts(userId, connection.accessToken),
            );
            break;
        }
      }

      const results = await Promise.allSettled(feedPromises);
      
      // Combine all posts
      const allPosts: ExternalPost[] = [];
      for (const result of results) {
        if (result.status === 'fulfilled') {
          allPosts.push(...result.value);
        }
      }

      // Sort by timestamp (newest first)
      allPosts.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      // Paginate
      const paginatedPosts = allPosts.slice(0, limit);

      return {
        items: paginatedPosts,
        hasMore: allPosts.length > limit,
        nextCursor: allPosts.length > limit ? String(limit) : undefined,
      };
    } catch (error) {
      console.error('Error fetching unified feed:', error);
      throw error;
    }
  }

  /**
   * Mock method to get user's platform connections
   * TODO: Replace with actual database query
   */
  private async getUserConnections(
    userId: string,
  ): Promise<Array<{ platform: string; accessToken: string }>> {
    // Mock connections - all platforms connected
    return [
      { platform: 'instagram', accessToken: 'mock-ig-token' },
      { platform: 'tiktok', accessToken: 'mock-tt-token' },
      { platform: 'facebook', accessToken: 'mock-fb-token' },
      { platform: 'x', accessToken: 'mock-x-token' },
    ];
  }
}
