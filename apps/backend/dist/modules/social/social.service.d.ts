export declare class SocialService {
    private readonly prisma;
    private readonly logger;
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
    awardBadge(userId: string, badgeId: string): Promise<any>;
    getLeaderboard(category: string, period?: string, limit?: number): Promise<any>;
    updateLeaderboardScore(userId: string, category: string, score: number, period?: string): Promise<{
        success: boolean;
    }>;
}
