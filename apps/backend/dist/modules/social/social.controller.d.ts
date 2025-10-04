import { SocialService } from './social.service';
import { ModerationService } from './moderation.service';
export declare class SocialController {
    private readonly socialService;
    private readonly moderationService;
    constructor(socialService: SocialService, moderationService: ModerationService);
    getMutualFollowers(userId1: string, userId2: string): Promise<any>;
    getFriendSuggestions(userId: string, limit?: number): Promise<any>;
    generateFriendSuggestions(userId: string): Promise<{
        generatedCount: number;
    }>;
    dismissSuggestion(userId: string, suggestedUserId: string): Promise<{
        success: boolean;
    }>;
    getUserGroups(userId: string): Promise<any>;
    createGroup(name: string, creatorId: string, description?: string, isPrivate?: boolean): Promise<any>;
    joinGroup(groupId: string, userId: string): Promise<any>;
    leaveGroup(groupId: string, userId: string): Promise<{
        success: boolean;
    }>;
    getAllBadges(): Promise<any>;
    getUserBadges(userId: string): Promise<any>;
    awardBadge(badgeId: string, userId: string): Promise<any>;
    getLeaderboard(category: string, period?: string, limit?: number): Promise<any>;
    updateLeaderboardScore(userId: string, category: string, score: number, period?: string): Promise<{
        success: boolean;
    }>;
    createReport(reporterId: string, reportedId: string, entityType: string, entityId: string, reason: string, description?: string): Promise<any>;
    getReports(status?: string, entityType?: string, limit?: number): Promise<any>;
    getReport(reportId: string): Promise<any>;
    updateReportStatus(reportId: string, status: string, reviewerId: string, resolution?: Record<string, unknown>): Promise<any>;
    getModerationStats(): Promise<{
        total: any;
        byStatus: {
            pending: any;
            reviewing: any;
            resolved: any;
            dismissed: any;
        };
        byType: any;
        byReason: any;
    }>;
}
