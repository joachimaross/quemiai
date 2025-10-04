import { ApiClient, UnifiedFeedResponse } from '@quemiai/shared';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';

class FeedService {
  private client: ApiClient;

  constructor() {
    this.client = new ApiClient(API_URL);
  }

  async getUnifiedFeed(limit = 20): Promise<UnifiedFeedResponse> {
    try {
      return await this.client.get<UnifiedFeedResponse>(`/feed?limit=${limit}`);
    } catch (error) {
      console.error('Error fetching feed:', error);
      throw error;
    }
  }
}

export const feedService = new FeedService();
