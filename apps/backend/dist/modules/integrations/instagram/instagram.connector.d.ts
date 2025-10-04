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
export declare class InstagramConnector {
    fetchPosts(userId: string, accessToken: string): Promise<ExternalPost[]>;
    fetchDirectMessages(userId: string, accessToken: string): Promise<any[]>;
}
