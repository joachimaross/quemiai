import { CacheService } from './cache.service';
export declare class AnalyticsService {
    private readonly cacheService;
    private readonly prisma;
    private readonly logger;
    constructor(cacheService: CacheService);
    trackEvent(eventType: string, entityType: string, entityId: string, userId?: string, metadata?: Record<string, unknown>, ipAddress?: string, userAgent?: string): Promise<void>;
    getPostAnalytics(postId: string): Promise<any>;
    updatePostAnalytics(postId: string, updates: {
        views?: number;
        likes?: number;
        comments?: number;
        shares?: number;
    }): Promise<any>;
    calculatePostEngagement(postId: string): Promise<void>;
    getUserAnalytics(userId: string): Promise<any>;
    calculateUserAnalytics(userId: string): Promise<any>;
    getUserTopPosts(userId: string, limit?: number): Promise<any>;
    getEntityEvents(entityType: string, entityId: string, eventType?: string, limit?: number): Promise<any>;
    getAnalyticsSummary(userId: string, startDate: Date, endDate: Date): Promise<{
        period: {
            start: Date;
            end: Date;
        };
        postsCount: any;
        totalViews: any;
        totalLikes: any;
        totalComments: any;
        totalShares: any;
        eventCounts: any;
    }>;
}
