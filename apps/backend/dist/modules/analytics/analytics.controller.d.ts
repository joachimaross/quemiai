import { AnalyticsService } from '../../services/analytics.service';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    trackEvent(eventType: string, entityType: string, entityId: string, userId?: string, metadata?: Record<string, unknown>, ipAddress?: string, userAgent?: string): Promise<{
        success: boolean;
    }>;
    getPostAnalytics(postId: string): Promise<any>;
    updatePostAnalytics(postId: string, views?: number, likes?: number, comments?: number, shares?: number): Promise<any>;
    getUserAnalytics(userId: string): Promise<any>;
    calculateUserAnalytics(userId: string): Promise<any>;
    getUserTopPosts(userId: string, limit?: number): Promise<any>;
    getAnalyticsSummary(userId: string, startDate: string, endDate: string): Promise<{
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
    getEntityEvents(entityType: string, entityId: string, eventType?: string, limit?: number): Promise<any>;
}
