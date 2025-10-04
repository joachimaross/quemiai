"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AnalyticsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const cache_service_1 = require("./cache.service");
let AnalyticsService = AnalyticsService_1 = class AnalyticsService {
    constructor(cacheService) {
        this.cacheService = cacheService;
        this.prisma = new client_1.PrismaClient();
        this.logger = new common_1.Logger(AnalyticsService_1.name);
    }
    async trackEvent(eventType, entityType, entityId, userId, metadata, ipAddress, userAgent) {
        try {
            await this.prisma.analyticsEvent.create({
                data: {
                    eventType,
                    entityType,
                    entityId,
                    userId,
                    metadata: metadata ? JSON.stringify(metadata) : null,
                    ipAddress,
                    userAgent,
                },
            });
            this.logger.debug(`Event tracked: ${eventType} for ${entityType}:${entityId}`);
        }
        catch (error) {
            this.logger.error('Error tracking event', error);
        }
    }
    async getPostAnalytics(postId) {
        const cacheKey = `analytics:post:${postId}`;
        const cached = await this.cacheService.get(cacheKey);
        if (cached) {
            return cached;
        }
        let analytics = await this.prisma.postAnalytics.findUnique({
            where: { postId },
        });
        if (!analytics) {
            analytics = await this.prisma.postAnalytics.create({
                data: { postId },
            });
        }
        await this.cacheService.set(cacheKey, analytics, 300);
        return analytics;
    }
    async updatePostAnalytics(postId, updates) {
        const analytics = await this.prisma.postAnalytics.upsert({
            where: { postId },
            update: {
                views: updates.views ? { increment: updates.views } : undefined,
                likes: updates.likes ? { increment: updates.likes } : undefined,
                comments: updates.comments ? { increment: updates.comments } : undefined,
                shares: updates.shares ? { increment: updates.shares } : undefined,
            },
            create: {
                postId,
                views: updates.views || 0,
                likes: updates.likes || 0,
                comments: updates.comments || 0,
                shares: updates.shares || 0,
            },
        });
        await this.cacheService.delete(`analytics:post:${postId}`);
        return analytics;
    }
    async calculatePostEngagement(postId) {
        const analytics = await this.prisma.postAnalytics.findUnique({
            where: { postId },
        });
        if (!analytics) {
            return;
        }
        const totalEngagement = analytics.likes + analytics.comments + analytics.shares;
        const engagementRate = analytics.views > 0 ? totalEngagement / analytics.views : 0;
        await this.prisma.postAnalytics.update({
            where: { postId },
            data: {
                engagementRate,
            },
        });
        await this.cacheService.delete(`analytics:post:${postId}`);
    }
    async getUserAnalytics(userId) {
        const cacheKey = `analytics:user:${userId}`;
        const cached = await this.cacheService.get(cacheKey);
        if (cached) {
            return cached;
        }
        let analytics = await this.prisma.userAnalytics.findUnique({
            where: { userId },
        });
        if (!analytics) {
            analytics = await this.calculateUserAnalytics(userId);
        }
        await this.cacheService.set(cacheKey, analytics, 600);
        return analytics;
    }
    async calculateUserAnalytics(userId) {
        const totalPosts = await this.prisma.post.count({
            where: { authorId: userId },
        });
        const totalFollowers = await this.prisma.follower.count({
            where: { followingId: userId },
        });
        const totalFollowing = await this.prisma.follower.count({
            where: { followerId: userId },
        });
        const posts = await this.prisma.post.findMany({
            where: { authorId: userId },
            select: { id: true },
        });
        const postIds = posts.map((p) => p.id);
        const totalLikes = await this.prisma.like.count({
            where: { postId: { in: postIds } },
        });
        const postAnalytics = await this.prisma.postAnalytics.findMany({
            where: { postId: { in: postIds } },
            select: { views: true, likes: true, comments: true, shares: true },
        });
        const totalViews = postAnalytics.reduce((sum, pa) => sum + pa.views, 0);
        const totalEngagement = postAnalytics.reduce((sum, pa) => sum + pa.likes + pa.comments + pa.shares, 0);
        const avgEngagementRate = totalViews > 0 ? totalEngagement / totalViews : 0;
        const analytics = await this.prisma.userAnalytics.upsert({
            where: { userId },
            update: {
                totalPosts,
                totalFollowers,
                totalFollowing,
                totalLikes,
                totalViews,
                totalEngagement,
                avgEngagementRate,
            },
            create: {
                userId,
                totalPosts,
                totalFollowers,
                totalFollowing,
                totalLikes,
                totalViews,
                totalEngagement,
                avgEngagementRate,
            },
        });
        await this.cacheService.delete(`analytics:user:${userId}`);
        return analytics;
    }
    async getUserTopPosts(userId, limit = 10) {
        const posts = await this.prisma.post.findMany({
            where: { authorId: userId },
            select: {
                id: true,
                content: true,
                mediaUrl: true,
                createdAt: true,
            },
        });
        const postIds = posts.map((p) => p.id);
        const analytics = await this.prisma.postAnalytics.findMany({
            where: { postId: { in: postIds } },
            orderBy: [{ engagementRate: 'desc' }, { views: 'desc' }],
            take: limit,
        });
        const topPosts = analytics.map((a) => {
            const post = posts.find((p) => p.id === a.postId);
            return {
                ...post,
                analytics: a,
            };
        });
        return topPosts;
    }
    async getEntityEvents(entityType, entityId, eventType, limit = 100) {
        const events = await this.prisma.analyticsEvent.findMany({
            where: {
                entityType,
                entityId,
                ...(eventType && { eventType }),
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
        return events;
    }
    async getAnalyticsSummary(userId, startDate, endDate) {
        const posts = await this.prisma.post.findMany({
            where: {
                authorId: userId,
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            select: { id: true },
        });
        const postIds = posts.map((p) => p.id);
        const events = await this.prisma.analyticsEvent.findMany({
            where: {
                entityType: 'post',
                entityId: { in: postIds },
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
        });
        const eventCounts = events.reduce((acc, event) => {
            acc[event.eventType] = (acc[event.eventType] || 0) + 1;
            return acc;
        }, {});
        const postAnalytics = await this.prisma.postAnalytics.findMany({
            where: { postId: { in: postIds } },
        });
        const totalViews = postAnalytics.reduce((sum, pa) => sum + pa.views, 0);
        const totalLikes = postAnalytics.reduce((sum, pa) => sum + pa.likes, 0);
        const totalComments = postAnalytics.reduce((sum, pa) => sum + pa.comments, 0);
        const totalShares = postAnalytics.reduce((sum, pa) => sum + pa.shares, 0);
        return {
            period: {
                start: startDate,
                end: endDate,
            },
            postsCount: posts.length,
            totalViews,
            totalLikes,
            totalComments,
            totalShares,
            eventCounts,
        };
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = AnalyticsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [cache_service_1.CacheService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map