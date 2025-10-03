import axios from 'axios';
import { config } from '../config';

const TIKTOK_API_BASE_URL = 'https://open.tiktokapis.com/v2';

interface TikTokUserData {
  openId: string;
  displayName: string;
  avatarUrl: string;
  followerCount: number;
  followingCount: number;
  videoCount: number;
}

interface TikTokPost {
  id: string;
  createTime: number;
  coverImageUrl: string;
  shareUrl: string;
  videoDescription: string;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  viewCount: number;
}

interface TikTokPostContent {
  videoUrl?: string;
  description?: string;
  privacyLevel?: 'PUBLIC_TO_EVERYONE' | 'MUTUAL_FOLLOW_FRIENDS' | 'SELF_ONLY';
}

export class TikTokService {
  private clientKey: string;
  private clientSecret: string;

  constructor() {
    this.clientKey = config.tiktok.clientKey;
    this.clientSecret = config.tiktok.clientSecret;
  }

  /**
   * Exchange authorization code for access token
   */
  async authenticate(code: string): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    try {
      const response = await axios.post(`${TIKTOK_API_BASE_URL}/oauth/token/`, {
        client_key: this.clientKey,
        client_secret: this.clientSecret,
        code,
        grant_type: 'authorization_code',
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresIn: response.data.expires_in,
      };
    } catch (error) {
      console.error('TikTok authentication error:', error);
      throw new Error('Failed to authenticate with TikTok API');
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    try {
      const response = await axios.post(`${TIKTOK_API_BASE_URL}/oauth/token/`, {
        client_key: this.clientKey,
        client_secret: this.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresIn: response.data.expires_in,
      };
    } catch (error) {
      console.error('TikTok token refresh error:', error);
      throw new Error('Failed to refresh TikTok access token');
    }
  }

  /**
   * Fetch user profile data
   */
  async getUserData(accessToken: string): Promise<TikTokUserData> {
    try {
      const response = await axios.get(`${TIKTOK_API_BASE_URL}/user/info/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          fields: 'open_id,display_name,avatar_url,follower_count,following_count,video_count',
        },
      });

      const userData = response.data.data.user;
      return {
        openId: userData.open_id,
        displayName: userData.display_name,
        avatarUrl: userData.avatar_url,
        followerCount: userData.follower_count,
        followingCount: userData.following_count,
        videoCount: userData.video_count,
      };
    } catch (error) {
      console.error('Error fetching TikTok user data:', error);
      throw new Error('Failed to fetch TikTok user data');
    }
  }

  /**
   * Fetch user's recent posts
   */
  async getUserPosts(accessToken: string, maxCount: number = 10): Promise<TikTokPost[]> {
    try {
      const response = await axios.post(
        `${TIKTOK_API_BASE_URL}/video/list/`,
        {
          max_count: maxCount,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.data.data || !response.data.data.videos) {
        return [];
      }

      return response.data.data.videos.map((video: any) => ({
        id: video.id,
        createTime: video.create_time,
        coverImageUrl: video.cover_image_url,
        shareUrl: video.share_url,
        videoDescription: video.video_description,
        likeCount: video.like_count,
        commentCount: video.comment_count,
        shareCount: video.share_count,
        viewCount: video.view_count,
      }));
    } catch (error) {
      console.error('Error fetching TikTok posts:', error);
      throw new Error('Failed to fetch TikTok posts');
    }
  }

  /**
   * Get engagement metrics for posts
   */
  async getEngagementMetrics(accessToken: string, videoIds: string[]): Promise<any[]> {
    try {
      const response = await axios.post(
        `${TIKTOK_API_BASE_URL}/video/query/`,
        {
          filters: {
            video_ids: videoIds,
          },
          fields: 'id,like_count,comment_count,share_count,view_count',
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.data.videos || [];
    } catch (error) {
      console.error('Error fetching TikTok engagement metrics:', error);
      throw new Error('Failed to fetch engagement metrics');
    }
  }

  /**
   * Post content to TikTok (Direct post)
   * Note: TikTok's API posting capabilities are limited. 
   * The actual implementation depends on the specific API access level.
   */
  async postContent(accessToken: string, content: TikTokPostContent): Promise<{ publishId: string; status: string }> {
    try {
      // This is a simplified implementation. Actual TikTok video posting
      // requires more complex flow with video upload and publishing steps.
      const response = await axios.post(
        `${TIKTOK_API_BASE_URL}/post/publish/video/init/`,
        {
          post_info: {
            title: content.description || '',
            privacy_level: content.privacyLevel || 'PUBLIC_TO_EVERYONE',
            disable_comment: false,
            disable_duet: false,
            disable_stitch: false,
          },
          source_info: {
            source: 'FILE_UPLOAD',
            video_url: content.videoUrl || '',
          },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        publishId: response.data.data.publish_id,
        status: response.data.data.status,
      };
    } catch (error) {
      console.error('Error posting to TikTok:', error);
      throw new Error('Failed to post content to TikTok');
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

export const tiktokService = new TikTokService();
