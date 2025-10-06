import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CacheService } from './cache.service';

@Injectable()
export class AnalyticsService {
  private readonly prisma = new PrismaClient();
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private readonly cacheService: CacheService) {}

  /**
   * Track an analytics event
   */
  async trackEvent(
    eventType: string,
    entityType: string,
    entityId: string,
    userId?: string,
    metadata?: Record<string, unknown>,
    ipAddress?: string,
    userAgent?: string,
  ) {
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
    } catch (error) {
      this.logger.error('Error tracking event', error);
    }
  }

  /**
   * Get post analytics
   */
  async getPostAnalytics(postId: string) {
    // Try to get from cache first
    const cacheKey = `analytics:post:${postId}`;
    const cached = await this.cacheService.get<PostAnalyticsData>(cacheKey);
    if (cached) {
      return cached;
    }

    // Get from database
    let analytics = await this.prisma.postAnalytics.findUnique({
      where: { postId },
    });

    // If doesn't exist, create initial record
    if (!analytics) {
      analytics = await this.prisma.postAnalytics.create({
        data: { postId },
      });
    }

    // Cache for 5 minutes
    await this.cacheService.set(cacheKey, analytics, { ttl: 300 });

    return analytics;
  }

  /**
   * Update post analytics (increment counters)
   */
  async updatePostAnalytics(
    postId: string,
    updates: {
      views?: number;
      likes?: number;
      comments?: number;
      shares?: number;
    },
  ) {
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

    // Invalidate cache
    await this.cacheService.delete(`analytics:post:${postId}`);

    return analytics;
  }

  /**
   * Calculate and update engagement rate for a post
   */
  async calculatePostEngagement(postId: string) {
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

    // Invalidate cache
    await this.cacheService.delete(`analytics:post:${postId}`);
  }

  /**
   * Get user analytics
   */
  async getUserAnalytics(userId: string) {
    // Try to get from cache first
    const cacheKey = `analytics:user:${userId}`;
    const cached = await this.cacheService.get<UserAnalyticsData>(cacheKey);
    if (cached) {
      return cached;
    }

    let analytics = await this.prisma.userAnalytics.findUnique({
      where: { userId },
    });

    // If doesn't exist, calculate and create
    if (!analytics) {
      analytics = await this.calculateUserAnalytics(userId);
    }

    // Cache for 10 minutes
    await this.cacheService.set(cacheKey, analytics, { ttl: 600 });

    return analytics;
  }

  /**
   * Calculate and update user analytics
   */
  async calculateUserAnalytics(userId: string) {
    // Get user's posts count
    const totalPosts = await this.prisma.post.count({
      where: { authorId: userId },
    });

    // Get followers count
    const totalFollowers = await this.prisma.follower.count({
      where: { followingId: userId },
    });

    // Get following count
    const totalFollowing = await this.prisma.follower.count({
      where: { followerId: userId },
    });

    // Get total likes on user's posts
    const posts = await this.prisma.post.findMany({
      where: { authorId: userId },
      select: { id: true },
    });

    const postIds = posts.map((p) => p.id);

    const totalLikes = await this.prisma.like.count({
      where: { postId: { in: postIds } },
    });

    // Get total views from post analytics
    const postAnalytics = await this.prisma.postAnalytics.findMany({
      where: { postId: { in: postIds } },
      select: { views: true, likes: true, comments: true, shares: true },
    });

    const totalViews = postAnalytics.reduce((sum, pa) => sum + pa.views, 0);
    const totalEngagement = postAnalytics.reduce(
      (sum, pa) => sum + pa.likes + pa.comments + pa.shares,
      0,
    );
    const avgEngagementRate = totalViews > 0 ? totalEngagement / totalViews : 0;

    // Upsert user analytics
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

    // Invalidate cache
    await this.cacheService.delete(`analytics:user:${userId}`);

    return analytics;
  }

  /**
   * Get top posts for a user
   */
  async getUserTopPosts(userId: string, limit: number = 10) {
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

    // Join posts with their analytics
    const topPosts = analytics.map((a) => {
      const post = posts.find((p) => p.id === a.postId);
      return {
        ...post,
        analytics: a,
      };
    });

    return topPosts;
  }

  /**
   * Get analytics events for an entity
   */
  async getEntityEvents(
    entityType: string,
    entityId: string,
    eventType?: string,
    limit: number = 100,
  ) {
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

  /**
   * Get analytics summary for a time period
   */
  async getAnalyticsSummary(userId: string, startDate: Date, endDate: Date) {
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

    // Group events by type
    const eventCounts = events.reduce(
      (acc, event) => {
        acc[event.eventType] = (acc[event.eventType] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

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
}

export interface PostAnalyticsData {
  id: string;
  postId: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  engagementRate: number;
  reachCount: number;
  impressionCount: number;
  avgWatchTime: number | null;
  completionRate: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserAnalyticsData {
  id: string;
  userId: string;
  totalPosts: number;
  totalFollowers: number;
  totalFollowing: number;
  totalLikes: number;
  totalViews: number;
  totalEngagement: number;
  avgEngagementRate: number;
  topPostId: string | null;
  createdAt: Date;
  updatedAt: Date;
}
