import axios, { AxiosInstance } from 'axios';
import { config } from '../config';

export class InstagramService {
  private client: AxiosInstance;
  private baseUrl = 'https://graph.facebook.com/v18.0';

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
      client_id: config.instagram.clientId,
      redirect_uri: config.instagram.redirectUri,
      scope: 'instagram_basic,instagram_content_publish,pages_show_list',
      response_type: 'code',
      state,
    });
    return `https://api.instagram.com/oauth/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for short-lived access token
   */
  async getShortLivedToken(code: string): Promise<{
    access_token: string;
    user_id: number;
  }> {
    const response = await axios.post(
      'https://api.instagram.com/oauth/access_token',
      {
        client_id: config.instagram.clientId,
        client_secret: config.instagram.clientSecret,
        grant_type: 'authorization_code',
        redirect_uri: config.instagram.redirectUri,
        code,
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
   * Exchange short-lived token for long-lived token (60 days)
   */
  async getLongLivedToken(shortLivedToken: string): Promise<{
    access_token: string;
    token_type: string;
    expires_in: number;
  }> {
    const response = await this.client.get('/access_token', {
      params: {
        grant_type: 'ig_exchange_token',
        client_secret: config.instagram.clientSecret,
        access_token: shortLivedToken,
      },
    });
    return response.data;
  }

  /**
   * Refresh long-lived token (extends for another 60 days)
   */
  async refreshLongLivedToken(accessToken: string): Promise<{
    access_token: string;
    token_type: string;
    expires_in: number;
  }> {
    const response = await this.client.get('/refresh_access_token', {
      params: {
        grant_type: 'ig_refresh_token',
        access_token: accessToken,
      },
    });
    return response.data;
  }

  /**
   * Get user profile information
   */
  async getUserProfile(accessToken: string, userId: string): Promise<{
    id: string;
    username: string;
    account_type: string;
    media_count: number;
    followers_count?: number;
    follows_count?: number;
    name?: string;
    profile_picture_url?: string;
    biography?: string;
    website?: string;
  }> {
    const response = await this.client.get(`/${userId}`, {
      params: {
        fields:
          'id,username,account_type,media_count,followers_count,follows_count,name,profile_picture_url,biography,website',
        access_token: accessToken,
      },
    });
    return response.data;
  }

  /**
   * Get user's media (posts)
   */
  async getUserMedia(
    accessToken: string,
    userId: string,
    limit = 25,
    after?: string,
  ): Promise<{
    data: any[];
    paging?: {
      cursors: {
        before: string;
        after: string;
      };
      next?: string;
    };
  }> {
    const params: any = {
      fields:
        'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,username,like_count,comments_count',
      access_token: accessToken,
      limit,
    };
    if (after) {
      params.after = after;
    }

    const response = await this.client.get(`/${userId}/media`, {
      params,
    });
    return response.data;
  }

  /**
   * Get insights for a media item (for business/creator accounts)
   */
  async getMediaInsights(
    accessToken: string,
    mediaId: string,
  ): Promise<{
    data: Array<{
      name: string;
      period: string;
      values: Array<{ value: number }>;
    }>;
  }> {
    const response = await this.client.get(`/${mediaId}/insights`, {
      params: {
        metric: 'engagement,impressions,reach,saved',
        access_token: accessToken,
      },
    });
    return response.data;
  }

  /**
   * Get user insights (for business/creator accounts)
   */
  async getUserInsights(
    accessToken: string,
    userId: string,
    metric = 'follower_count,profile_views',
    period = 'day',
  ): Promise<any> {
    const response = await this.client.get(`/${userId}/insights`, {
      params: {
        metric,
        period,
        access_token: accessToken,
      },
    });
    return response.data;
  }

  /**
   * Create a media container for posting (single image/video)
   */
  async createMediaContainer(
    accessToken: string,
    userId: string,
    imageUrl: string,
    caption?: string,
  ): Promise<{
    id: string;
  }> {
    const response = await this.client.post(`/${userId}/media`, null, {
      params: {
        image_url: imageUrl,
        caption,
        access_token: accessToken,
      },
    });
    return response.data;
  }

  /**
   * Create a video media container
   */
  async createVideoContainer(
    accessToken: string,
    userId: string,
    videoUrl: string,
    caption?: string,
    coverUrl?: string,
  ): Promise<{
    id: string;
  }> {
    const params: any = {
      media_type: 'VIDEO',
      video_url: videoUrl,
      caption,
      access_token: accessToken,
    };
    if (coverUrl) {
      params.thumb_offset = 0;
    }

    const response = await this.client.post(`/${userId}/media`, null, {
      params,
    });
    return response.data;
  }

  /**
   * Publish a media container
   */
  async publishMedia(
    accessToken: string,
    userId: string,
    creationId: string,
  ): Promise<{
    id: string;
  }> {
    const response = await this.client.post(`/${userId}/media_publish`, null, {
      params: {
        creation_id: creationId,
        access_token: accessToken,
      },
    });
    return response.data;
  }

  /**
   * Get media details
   */
  async getMedia(accessToken: string, mediaId: string): Promise<any> {
    const response = await this.client.get(`/${mediaId}`, {
      params: {
        fields:
          'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count',
        access_token: accessToken,
      },
    });
    return response.data;
  }

  /**
   * Get comments on a media item
   */
  async getMediaComments(
    accessToken: string,
    mediaId: string,
  ): Promise<{
    data: Array<{
      id: string;
      text: string;
      username: string;
      timestamp: string;
    }>;
  }> {
    const response = await this.client.get(`/${mediaId}/comments`, {
      params: {
        fields: 'id,text,username,timestamp',
        access_token: accessToken,
      },
    });
    return response.data;
  }

  /**
   * Post content to Instagram (complete flow)
   */
  async postContent(
    accessToken: string,
    userId: string,
    mediaUrl: string,
    caption?: string,
    isVideo = false,
  ): Promise<{ id: string; permalink?: string }> {
    // Step 1: Create media container
    let containerResponse;
    if (isVideo) {
      containerResponse = await this.createVideoContainer(
        accessToken,
        userId,
        mediaUrl,
        caption,
      );
    } else {
      containerResponse = await this.createMediaContainer(
        accessToken,
        userId,
        mediaUrl,
        caption,
      );
    }

    // Step 2: Publish the media
    const publishResponse = await this.publishMedia(
      accessToken,
      userId,
      containerResponse.id,
    );

    // Step 3: Get the published media details
    const mediaDetails = await this.getMedia(accessToken, publishResponse.id);

    return {
      id: publishResponse.id,
      permalink: mediaDetails.permalink,
    };
  }
}

export const instagramService = new InstagramService();
