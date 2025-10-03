import axios from 'axios';
import { config } from '../config';

const INSTAGRAM_GRAPH_API_BASE_URL = 'https://graph.instagram.com';
const FACEBOOK_GRAPH_API_BASE_URL = 'https://graph.facebook.com/v18.0';

interface InstagramUserData {
  id: string;
  username: string;
  accountType: string;
  mediaCount: number;
  followersCount?: number;
  followsCount?: number;
}

interface InstagramPost {
  id: string;
  caption: string;
  mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  mediaUrl: string;
  permalink: string;
  timestamp: string;
  likeCount?: number;
  commentsCount?: number;
}

interface InstagramInsights {
  impressions: number;
  reach: number;
  engagement: number;
  saved: number;
  videoViews?: number;
}

interface InstagramPostContent {
  imageUrl?: string;
  videoUrl?: string;
  caption?: string;
  mediaType?: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
}

export class InstagramService {
  private clientId: string;
  private clientSecret: string;

  constructor() {
    this.clientId = config.instagram.clientId;
    this.clientSecret = config.instagram.clientSecret;
  }

  /**
   * Exchange authorization code for access token
   */
  async authenticate(code: string, redirectUri: string): Promise<{ accessToken: string; userId: string }> {
    try {
      const response = await axios.post(
        `${FACEBOOK_GRAPH_API_BASE_URL}/oauth/access_token`,
        null,
        {
          params: {
            client_id: this.clientId,
            client_secret: this.clientSecret,
            grant_type: 'authorization_code',
            redirect_uri: redirectUri,
            code,
          },
        }
      );

      return {
        accessToken: response.data.access_token,
        userId: response.data.user_id,
      };
    } catch (error) {
      console.error('Instagram authentication error:', error);
      throw new Error('Failed to authenticate with Instagram API');
    }
  }

  /**
   * Exchange short-lived token for long-lived token
   */
  async getLongLivedToken(shortLivedToken: string): Promise<{ accessToken: string; expiresIn: number }> {
    try {
      const response = await axios.get(`${FACEBOOK_GRAPH_API_BASE_URL}/oauth/access_token`, {
        params: {
          grant_type: 'ig_exchange_token',
          client_secret: this.clientSecret,
          access_token: shortLivedToken,
        },
      });

      return {
        accessToken: response.data.access_token,
        expiresIn: response.data.expires_in,
      };
    } catch (error) {
      console.error('Error exchanging Instagram token:', error);
      throw new Error('Failed to exchange Instagram token');
    }
  }

  /**
   * Refresh long-lived access token
   */
  async refreshAccessToken(accessToken: string): Promise<{ accessToken: string; expiresIn: number }> {
    try {
      const response = await axios.get(`${FACEBOOK_GRAPH_API_BASE_URL}/refresh_access_token`, {
        params: {
          grant_type: 'ig_refresh_token',
          access_token: accessToken,
        },
      });

      return {
        accessToken: response.data.access_token,
        expiresIn: response.data.expires_in,
      };
    } catch (error) {
      console.error('Error refreshing Instagram token:', error);
      throw new Error('Failed to refresh Instagram access token');
    }
  }

  /**
   * Fetch user profile data
   */
  async getUserData(accessToken: string): Promise<InstagramUserData> {
    try {
      const response = await axios.get(`${INSTAGRAM_GRAPH_API_BASE_URL}/me`, {
        params: {
          fields: 'id,username,account_type,media_count',
          access_token: accessToken,
        },
      });

      return {
        id: response.data.id,
        username: response.data.username,
        accountType: response.data.account_type,
        mediaCount: response.data.media_count,
      };
    } catch (error) {
      console.error('Error fetching Instagram user data:', error);
      throw new Error('Failed to fetch Instagram user data');
    }
  }

  /**
   * Fetch user's business account insights (followers, follows)
   */
  async getBusinessAccountData(userId: string, accessToken: string): Promise<Partial<InstagramUserData>> {
    try {
      const response = await axios.get(`${FACEBOOK_GRAPH_API_BASE_URL}/${userId}`, {
        params: {
          fields: 'followers_count,follows_count,media_count,username',
          access_token: accessToken,
        },
      });

      return {
        followersCount: response.data.followers_count,
        followsCount: response.data.follows_count,
        mediaCount: response.data.media_count,
        username: response.data.username,
      };
    } catch (error) {
      console.error('Error fetching Instagram business account data:', error);
      // Non-business accounts won't have this data, so we return partial data
      return {};
    }
  }

  /**
   * Fetch user's recent posts
   */
  async getUserPosts(accessToken: string, limit: number = 10): Promise<InstagramPost[]> {
    try {
      const response = await axios.get(`${INSTAGRAM_GRAPH_API_BASE_URL}/me/media`, {
        params: {
          fields: 'id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count',
          access_token: accessToken,
          limit,
        },
      });

      if (!response.data.data) {
        return [];
      }

      return response.data.data.map((post: any) => ({
        id: post.id,
        caption: post.caption || '',
        mediaType: post.media_type,
        mediaUrl: post.media_url,
        permalink: post.permalink,
        timestamp: post.timestamp,
        likeCount: post.like_count,
        commentsCount: post.comments_count,
      }));
    } catch (error) {
      console.error('Error fetching Instagram posts:', error);
      throw new Error('Failed to fetch Instagram posts');
    }
  }

  /**
   * Get insights for a specific post
   */
  async getPostInsights(mediaId: string, accessToken: string): Promise<InstagramInsights> {
    try {
      const response = await axios.get(`${FACEBOOK_GRAPH_API_BASE_URL}/${mediaId}/insights`, {
        params: {
          metric: 'impressions,reach,engagement,saved',
          access_token: accessToken,
        },
      });

      const insights: InstagramInsights = {
        impressions: 0,
        reach: 0,
        engagement: 0,
        saved: 0,
      };

      if (response.data.data) {
        response.data.data.forEach((metric: any) => {
          if (metric.name === 'impressions') {
            insights.impressions = metric.values[0].value;
          } else if (metric.name === 'reach') {
            insights.reach = metric.values[0].value;
          } else if (metric.name === 'engagement') {
            insights.engagement = metric.values[0].value;
          } else if (metric.name === 'saved') {
            insights.saved = metric.values[0].value;
          }
        });
      }

      return insights;
    } catch (error) {
      console.error('Error fetching Instagram post insights:', error);
      throw new Error('Failed to fetch post insights');
    }
  }

  /**
   * Get engagement metrics for recent posts
   */
  async getEngagementMetrics(accessToken: string, postIds: string[]): Promise<any[]> {
    try {
      const metrics = await Promise.all(
        postIds.map(async (postId) => {
          try {
            const insights = await this.getPostInsights(postId, accessToken);
            return { postId, ...insights };
          } catch (error) {
            console.error(`Error fetching metrics for post ${postId}:`, error);
            return { postId, error: 'Failed to fetch metrics' };
          }
        })
      );

      return metrics;
    } catch (error) {
      console.error('Error fetching engagement metrics:', error);
      throw new Error('Failed to fetch engagement metrics');
    }
  }

  /**
   * Create a media container for posting
   */
  private async createMediaContainer(
    userId: string,
    accessToken: string,
    content: InstagramPostContent
  ): Promise<string> {
    try {
      const params: any = {
        access_token: accessToken,
      };

      if (content.mediaType === 'IMAGE' && content.imageUrl) {
        params.image_url = content.imageUrl;
      } else if (content.mediaType === 'VIDEO' && content.videoUrl) {
        params.media_type = 'VIDEO';
        params.video_url = content.videoUrl;
      }

      if (content.caption) {
        params.caption = content.caption;
      }

      const response = await axios.post(
        `${FACEBOOK_GRAPH_API_BASE_URL}/${userId}/media`,
        null,
        { params }
      );

      return response.data.id;
    } catch (error) {
      console.error('Error creating Instagram media container:', error);
      throw new Error('Failed to create media container');
    }
  }

  /**
   * Publish media container
   */
  private async publishMediaContainer(userId: string, accessToken: string, creationId: string): Promise<string> {
    try {
      const response = await axios.post(
        `${FACEBOOK_GRAPH_API_BASE_URL}/${userId}/media_publish`,
        null,
        {
          params: {
            creation_id: creationId,
            access_token: accessToken,
          },
        }
      );

      return response.data.id;
    } catch (error) {
      console.error('Error publishing Instagram media:', error);
      throw new Error('Failed to publish media to Instagram');
    }
  }

  /**
   * Post content to Instagram
   */
  async postContent(
    userId: string,
    accessToken: string,
    content: InstagramPostContent
  ): Promise<{ mediaId: string; status: string }> {
    try {
      // Step 1: Create media container
      const creationId = await this.createMediaContainer(userId, accessToken, content);

      // Step 2: Publish the media
      const mediaId = await this.publishMediaContainer(userId, accessToken, creationId);

      return {
        mediaId,
        status: 'published',
      };
    } catch (error) {
      console.error('Error posting to Instagram:', error);
      throw new Error('Failed to post content to Instagram');
    }
  }

  /**
   * Validate access token
   */
  async validateToken(accessToken: string): Promise<boolean> {
    try {
      await this.getUserData(accessToken);
      return true;
    } catch (error) {
      return false;
    }
  }
}

export const instagramService = new InstagramService();
