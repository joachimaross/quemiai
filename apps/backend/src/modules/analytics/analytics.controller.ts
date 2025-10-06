import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import {
  AnalyticsService,
  PostAnalyticsData,
  UserAnalyticsData,
} from '../../services/analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * Track an analytics event
   * POST /analytics/events
   */
  @Post('events')
  async trackEvent(
    @Body('eventType') eventType: string,
    @Body('entityType') entityType: string,
    @Body('entityId') entityId: string,
    @Body('userId') userId?: string,
    @Body('metadata') metadata?: Record<string, unknown>,
    @Body('ipAddress') ipAddress?: string,
    @Body('userAgent') userAgent?: string,
  ) {
    await this.analyticsService.trackEvent(
      eventType,
      entityType,
      entityId,
      userId,
      metadata,
      ipAddress,
      userAgent,
    );
    return { success: true };
  }

  /**
   * Get post analytics
   * GET /analytics/posts/:postId
   */
  @Get('posts/:postId')
  async getPostAnalytics(
    @Param('postId') postId: string,
  ): Promise<PostAnalyticsData> {
    return this.analyticsService.getPostAnalytics(postId);
  }

  /**
   * Update post analytics
   * POST /analytics/posts/:postId
   */
  @Post('posts/:postId')
  async updatePostAnalytics(
    @Param('postId') postId: string,
    @Body('views') views?: number,
    @Body('likes') likes?: number,
    @Body('comments') comments?: number,
    @Body('shares') shares?: number,
  ) {
    return this.analyticsService.updatePostAnalytics(postId, {
      views,
      likes,
      comments,
      shares,
    });
  }

  /**
   * Get user analytics
   * GET /analytics/users/:userId
   */
  @Get('users/:userId')
  async getUserAnalytics(
    @Param('userId') userId: string,
  ): Promise<UserAnalyticsData> {
    return this.analyticsService.getUserAnalytics(userId);
  }

  /**
   * Recalculate user analytics
   * POST /analytics/users/:userId/calculate
   */
  @Post('users/:userId/calculate')
  async calculateUserAnalytics(@Param('userId') userId: string) {
    return this.analyticsService.calculateUserAnalytics(userId);
  }

  /**
   * Get top posts for a user
   * GET /analytics/users/:userId/top-posts
   */
  @Get('users/:userId/top-posts')
  async getUserTopPosts(@Param('userId') userId: string, @Query('limit') limit?: number) {
    return this.analyticsService.getUserTopPosts(
      userId,
      limit ? parseInt(limit.toString(), 10) : 10,
    );
  }

  /**
   * Get analytics summary for a time period
   * GET /analytics/users/:userId/summary
   */
  @Get('users/:userId/summary')
  async getAnalyticsSummary(
    @Param('userId') userId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.analyticsService.getAnalyticsSummary(
      userId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  /**
   * Get events for an entity
   * GET /analytics/events/:entityType/:entityId
   */
  @Get('events/:entityType/:entityId')
  async getEntityEvents(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @Query('eventType') eventType?: string,
    @Query('limit') limit?: number,
  ) {
    return this.analyticsService.getEntityEvents(
      entityType,
      entityId,
      eventType,
      limit ? parseInt(limit.toString(), 10) : 100,
    );
  }
}
