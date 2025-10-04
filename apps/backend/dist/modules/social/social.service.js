"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var SocialService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let SocialService = SocialService_1 = class SocialService {
    constructor() {
        this.prisma = new client_1.PrismaClient();
        this.logger = new common_1.Logger(SocialService_1.name);
    }
    async getMutualFollowers(userId1, userId2) {
        const followers1 = await this.prisma.follower.findMany({
            where: { followingId: userId1 },
            select: { followerId: true },
        });
        const followers2 = await this.prisma.follower.findMany({
            where: { followingId: userId2 },
            select: { followerId: true },
        });
        const followerIds1 = followers1.map((f) => f.followerId);
        const followerIds2 = followers2.map((f) => f.followerId);
        const mutualIds = followerIds1.filter((id) => followerIds2.includes(id));
        const mutualUsers = await this.prisma.user.findMany({
            where: { id: { in: mutualIds } },
            select: {
                id: true,
                name: true,
                avatar: true,
                bio: true,
            },
        });
        return mutualUsers;
    }
    async getFriendSuggestions(userId, limit = 10) {
        const suggestions = await this.prisma.friendSuggestion.findMany({
            where: {
                userId,
                dismissed: false,
            },
            orderBy: { score: 'desc' },
            take: limit,
        });
        const suggestedUserIds = suggestions.map((s) => s.suggestedUserId);
        const users = await this.prisma.user.findMany({
            where: { id: { in: suggestedUserIds } },
            select: {
                id: true,
                name: true,
                avatar: true,
                bio: true,
            },
        });
        return suggestions.map((suggestion) => ({
            ...suggestion,
            user: users.find((u) => u.id === suggestion.suggestedUserId),
        }));
    }
    async generateFriendSuggestions(userId) {
        const followers = await this.prisma.follower.findMany({
            where: { followingId: userId },
            select: { followerId: true },
        });
        const following = await this.prisma.follower.findMany({
            where: { followerId: userId },
            select: { followingId: true },
        });
        const followerIds = followers.map((f) => f.followerId);
        const followingIds = following.map((f) => f.followingId);
        const connectedIds = [...followerIds, ...followingIds];
        const friendsOfFriends = await this.prisma.follower.findMany({
            where: {
                followerId: { in: connectedIds },
                followingId: { notIn: [userId, ...connectedIds] },
            },
            select: { followingId: true },
        });
        const suggestionScores = new Map();
        friendsOfFriends.forEach((f) => {
            const count = suggestionScores.get(f.followingId) || 0;
            suggestionScores.set(f.followingId, count + 1);
        });
        const promises = Array.from(suggestionScores.entries()).map(async ([suggestedUserId, count]) => {
            return this.prisma.friendSuggestion.upsert({
                where: {
                    userId_suggestedUserId: {
                        userId,
                        suggestedUserId,
                    },
                },
                update: {
                    score: count,
                    reason: 'mutual_connections',
                },
                create: {
                    userId,
                    suggestedUserId,
                    score: count,
                    reason: 'mutual_connections',
                },
            });
        });
        await Promise.all(promises);
        this.logger.log(`Generated ${suggestionScores.size} friend suggestions for user ${userId}`);
        return { generatedCount: suggestionScores.size };
    }
    async dismissSuggestion(userId, suggestedUserId) {
        await this.prisma.friendSuggestion.update({
            where: {
                userId_suggestedUserId: {
                    userId,
                    suggestedUserId,
                },
            },
            data: {
                dismissed: true,
            },
        });
        return { success: true };
    }
    async getUserGroups(userId) {
        const memberships = await this.prisma.groupMember.findMany({
            where: { userId },
            include: {
                group: {
                    include: {
                        creator: {
                            select: {
                                id: true,
                                name: true,
                                avatar: true,
                            },
                        },
                        _count: {
                            select: {
                                members: true,
                            },
                        },
                    },
                },
            },
        });
        return memberships.map((m) => ({
            ...m.group,
            role: m.role,
            joinedAt: m.joinedAt,
        }));
    }
    async createGroup(name, creatorId, description, isPrivate = false) {
        const group = await this.prisma.group.create({
            data: {
                name,
                description,
                isPrivate,
                creatorId,
                members: {
                    create: {
                        userId: creatorId,
                        role: 'admin',
                    },
                },
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
                _count: {
                    select: {
                        members: true,
                    },
                },
            },
        });
        this.logger.log(`Group created: ${group.id} by user ${creatorId}`);
        return group;
    }
    async joinGroup(groupId, userId) {
        const group = await this.prisma.group.findUnique({
            where: { id: groupId },
        });
        if (!group) {
            throw new common_1.NotFoundException('Group not found');
        }
        const membership = await this.prisma.groupMember.create({
            data: {
                groupId,
                userId,
                role: 'member',
            },
        });
        this.logger.log(`User ${userId} joined group ${groupId}`);
        return membership;
    }
    async leaveGroup(groupId, userId) {
        const membership = await this.prisma.groupMember.findUnique({
            where: {
                groupId_userId: {
                    groupId,
                    userId,
                },
            },
        });
        if (!membership) {
            throw new common_1.NotFoundException('Group membership not found');
        }
        await this.prisma.groupMember.delete({
            where: {
                id: membership.id,
            },
        });
        this.logger.log(`User ${userId} left group ${groupId}`);
        return { success: true };
    }
    async getAllBadges() {
        return this.prisma.badge.findMany({
            orderBy: [{ category: 'asc' }, { rarity: 'desc' }],
        });
    }
    async getUserBadges(userId) {
        const userBadges = await this.prisma.userBadge.findMany({
            where: { userId },
            include: {
                badge: true,
            },
            orderBy: { earnedAt: 'desc' },
        });
        return userBadges;
    }
    async awardBadge(userId, badgeId) {
        const badge = await this.prisma.badge.findUnique({
            where: { id: badgeId },
        });
        if (!badge) {
            throw new common_1.NotFoundException('Badge not found');
        }
        const userBadge = await this.prisma.userBadge.create({
            data: {
                userId,
                badgeId,
            },
            include: {
                badge: true,
            },
        });
        this.logger.log(`Badge ${badgeId} awarded to user ${userId}`);
        return userBadge;
    }
    async getLeaderboard(category, period = 'all_time', limit = 100) {
        const leaderboard = await this.prisma.leaderboard.findMany({
            where: {
                category,
                period,
            },
            orderBy: { score: 'desc' },
            take: limit,
        });
        const userIds = leaderboard.map((l) => l.userId);
        const users = await this.prisma.user.findMany({
            where: { id: { in: userIds } },
            select: {
                id: true,
                name: true,
                avatar: true,
            },
        });
        return leaderboard.map((entry, index) => ({
            ...entry,
            rank: index + 1,
            user: users.find((u) => u.id === entry.userId),
        }));
    }
    async updateLeaderboardScore(userId, category, score, period = 'all_time') {
        await this.prisma.leaderboard.upsert({
            where: {
                userId_category_period: {
                    userId,
                    category,
                    period,
                },
            },
            update: {
                score,
            },
            create: {
                userId,
                category,
                score,
                period,
            },
        });
        return { success: true };
    }
};
exports.SocialService = SocialService;
exports.SocialService = SocialService = SocialService_1 = __decorate([
    (0, common_1.Injectable)()
], SocialService);
//# sourceMappingURL=social.service.js.map