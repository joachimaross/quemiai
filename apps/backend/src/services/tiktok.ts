import axios, { AxiosInstance } from 'axios';
import { config } from '../config';

export class TikTokService {
  private client: AxiosInstance;
  private baseUrl = 'https://open.tiktokapis.com/v2';

  constructor() {
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Get authorization URL for OAuth 2.0 flow
   */
  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_key: config.tiktok.clientKey,
      response_type: 'code',
      scope: 'user.info.basic,video.list,video.upload',
      redirect_uri: config.tiktok.redirectUri,
      state,
    });
    return `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async getAccessToken(code: string): Promise<{
    access_token: string;
    expires_in: number;
    refresh_token: string;
    token_type: string;
  }> {
    const response = await axios.post(
      'https://open.tiktokapis.com/v2/oauth/token/',
      {
        client_key: config.tiktok.clientKey,
        client_secret: config.tiktok.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: config.tiktok.redirectUri,
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );
    return response.data;
  }

  /**
   * Get user information
   */
  async getUserInfo(accessToken: string): Promise<{
    open_id: string;
    union_id: string;
    avatar_url: string;
    display_name: string;
    follower_count: number;
    following_count: number;
    likes_count: number;
    video_count: number;
  }> {
    const response = await this.client.get('/user/info/', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        fields:
          'open_id,union_id,avatar_url,display_name,follower_count,following_count,likes_count,video_count',
      },
    });
    return response.data.data.user;
  }

  /**
   * Get user's videos
   */
  async getUserVideos(
    accessToken: string,
    cursor?: string,
    maxCount = 20,
  ): Promise<{
    videos: unknown[];
    cursor: string;
    has_more: boolean;
  }> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const params: any = {
      max_count: maxCount,
    };
    if (cursor) {
      params.cursor = cursor;
    }

    const response = await this.client.get('/video/list/', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params,
    });
    return response.data.data;
  }

  /**
   * Get video analytics/insights
   */
  async getVideoInsights(accessToken: string, videoIds: string[]): Promise<unknown> {
    const response = await this.client.post(
      '/video/query/',
      {
        filters: {
          video_ids: videoIds,
        },
        fields:
          'id,create_time,cover_image_url,share_url,video_description,duration,height,width,title,embed_html,embed_link,like_count,comment_count,share_count,view_count',
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    return response.data.data;
  }

  /**
   * Initialize video upload
   */
  async initializeVideoUpload(accessToken: string): Promise<{
    upload_url: string;
    publish_id: string;
  }> {
    const response = await this.client.post(
      '/post/publish/video/init/',
      {
        post_info: {
          title: 'Video from Quemiai',
          privacy_level: 'PUBLIC_TO_EVERYONE',
          disable_duet: false,
          disable_comment: false,
          disable_stitch: false,
          video_cover_timestamp_ms: 1000,
        },
        source_info: {
          source: 'PULL_FROM_URL',
          video_url: '',
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );
    return response.data.data;
  }

  /**
   * Publish video
   */
  async publishVideo(
    accessToken: string,
    videoUrl: string,
    title: string,
    description?: string,
  ): Promise<unknown> {
    const response = await this.client.post(
      '/post/publish/video/init/',
      {
        post_info: {
          title,
          description,
          privacy_level: 'PUBLIC_TO_EVERYONE',
          disable_duet: false,
          disable_comment: false,
          disable_stitch: false,
          video_cover_timestamp_ms: 1000,
        },
        source_info: {
          source: 'PULL_FROM_URL',
          video_url: videoUrl,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );
    return response.data;
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<{
    access_token: string;
    expires_in: number;
    refresh_token: string;
  }> {
    const response = await axios.post(
      'https://open.tiktokapis.com/v2/oauth/token/',
      {
        client_key: config.tiktok.clientKey,
        client_secret: config.tiktok.clientSecret,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );
    return response.data;
  }
}

export const tiktokService = new TikTokService();
