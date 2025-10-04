export declare class InstagramService {
    private client;
    private baseUrl;
    constructor();
    getAuthorizationUrl(state: string): string;
    getShortLivedToken(code: string): Promise<{
        access_token: string;
        user_id: number;
    }>;
    getLongLivedToken(shortLivedToken: string): Promise<{
        access_token: string;
        token_type: string;
        expires_in: number;
    }>;
    refreshLongLivedToken(accessToken: string): Promise<{
        access_token: string;
        token_type: string;
        expires_in: number;
    }>;
    getUserProfile(accessToken: string, userId: string): Promise<{
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
    }>;
    getUserMedia(accessToken: string, userId: string, limit?: number, after?: string): Promise<{
        data: unknown[];
        paging?: {
            cursors: {
                before: string;
                after: string;
            };
            next?: string;
        };
    }>;
    getMediaInsights(accessToken: string, mediaId: string): Promise<{
        data: Array<{
            name: string;
            period: string;
            values: Array<{
                value: number;
            }>;
        }>;
    }>;
    getUserInsights(accessToken: string, userId: string, metric?: string, period?: string): Promise<unknown>;
    createMediaContainer(accessToken: string, userId: string, imageUrl: string, caption?: string): Promise<{
        id: string;
    }>;
    createVideoContainer(accessToken: string, userId: string, videoUrl: string, caption?: string, coverUrl?: string): Promise<{
        id: string;
    }>;
    publishMedia(accessToken: string, userId: string, creationId: string): Promise<{
        id: string;
    }>;
    getMedia(accessToken: string, mediaId: string): Promise<unknown>;
    getMediaComments(accessToken: string, mediaId: string): Promise<{
        data: Array<{
            id: string;
            text: string;
            username: string;
            timestamp: string;
        }>;
    }>;
    postContent(accessToken: string, userId: string, mediaUrl: string, caption?: string, isVideo?: boolean): Promise<{
        id: string;
        permalink?: string;
    }>;
}
export declare const instagramService: InstagramService;
