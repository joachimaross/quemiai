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
export declare class FeedService {
    private instagramConnector;
    private tiktokConnector;
    private facebookConnector;
    private xConnector;
    constructor(instagramConnector: InstagramConnector, tiktokConnector: TikTokConnector, facebookConnector: FacebookConnector, xConnector: XConnector);
    getUnifiedFeed(userId: string, limit?: number): Promise<UnifiedFeedResponse>;
    private getUserConnections;
}
