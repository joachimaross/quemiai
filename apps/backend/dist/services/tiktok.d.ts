export declare class TikTokService {
    private client;
    private baseUrl;
    constructor();
    getAuthorizationUrl(state: string): string;
    getAccessToken(code: string): Promise<{
        access_token: string;
        expires_in: number;
        refresh_token: string;
        token_type: string;
    }>;
    getUserInfo(accessToken: string): Promise<{
        open_id: string;
        union_id: string;
        avatar_url: string;
        display_name: string;
        follower_count: number;
        following_count: number;
        likes_count: number;
        video_count: number;
    }>;
    getUserVideos(accessToken: string, cursor?: string, maxCount?: number): Promise<{
        videos: unknown[];
        cursor: string;
        has_more: boolean;
    }>;
    getVideoInsights(accessToken: string, videoIds: string[]): Promise<unknown>;
    initializeVideoUpload(accessToken: string): Promise<{
        upload_url: string;
        publish_id: string;
    }>;
    publishVideo(accessToken: string, videoUrl: string, title: string, description?: string): Promise<unknown>;
    refreshAccessToken(refreshToken: string): Promise<{
        access_token: string;
        expires_in: number;
        refresh_token: string;
    }>;
}
export declare const tiktokService: TikTokService;
