import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { SocialService } from './social.service';
import { ModerationService } from './moderation.service';

@Controller('social')
export class SocialController {
  constructor(
    private readonly socialService: SocialService,
    private readonly moderationService: ModerationService,
  ) {}

  /**
   * Get mutual followers between two users
   * GET /social/mutuals/:userId1/:userId2
   */
  @Get('mutuals/:userId1/:userId2')
  async getMutualFollowers(@Param('userId1') userId1: string, @Param('userId2') userId2: string) {
    return this.socialService.getMutualFollowers(userId1, userId2);
  }

  /**
   * Get friend suggestions for a user
   * GET /social/suggestions/:userId
   */
  @Get('suggestions/:userId')
  async getFriendSuggestions(@Param('userId') userId: string, @Query('limit') limit?: number) {
    return this.socialService.getFriendSuggestions(
      userId,
      limit ? parseInt(limit.toString(), 10) : 10,
    );
  }

  /**
   * Generate friend suggestions
   * POST /social/suggestions/:userId/generate
   */
  @Post('suggestions/:userId/generate')
  async generateFriendSuggestions(@Param('userId') userId: string) {
    return this.socialService.generateFriendSuggestions(userId);
  }

  /**
   * Dismiss a friend suggestion
   * DELETE /social/suggestions/:userId/:suggestedUserId
   */
  @Delete('suggestions/:userId/:suggestedUserId')
  async dismissSuggestion(
    @Param('userId') userId: string,
    @Param('suggestedUserId') suggestedUserId: string,
  ) {
    return this.socialService.dismissSuggestion(userId, suggestedUserId);
  }

  /**
   * Get user's groups
   * GET /social/groups/user/:userId
   */
  @Get('groups/user/:userId')
  async getUserGroups(@Param('userId') userId: string) {
    return this.socialService.getUserGroups(userId);
  }

  /**
   * Create a group
   * POST /social/groups
   */
  @Post('groups')
  async createGroup(
    @Body('name') name: string,
    @Body('creatorId') creatorId: string,
    @Body('description') description?: string,
    @Body('isPrivate') isPrivate?: boolean,
  ) {
    return this.socialService.createGroup(name, creatorId, description, isPrivate);
  }

  /**
   * Join a group
   * POST /social/groups/:groupId/join
   */
  @Post('groups/:groupId/join')
  async joinGroup(@Param('groupId') groupId: string, @Body('userId') userId: string) {
    return this.socialService.joinGroup(groupId, userId);
  }

  /**
   * Leave a group
   * DELETE /social/groups/:groupId/leave/:userId
   */
  @Delete('groups/:groupId/leave/:userId')
  async leaveGroup(@Param('groupId') groupId: string, @Param('userId') userId: string) {
    return this.socialService.leaveGroup(groupId, userId);
  }

  /**
   * Get all badges
   * GET /social/badges
   */
  @Get('badges')
  async getAllBadges() {
    return this.socialService.getAllBadges();
  }

  /**
   * Get user's badges
   * GET /social/badges/user/:userId
   */
  @Get('badges/user/:userId')
  async getUserBadges(@Param('userId') userId: string) {
    return this.socialService.getUserBadges(userId);
  }

  /**
   * Award a badge to a user
   * POST /social/badges/:badgeId/award
   */
  @Post('badges/:badgeId/award')
  async awardBadge(@Param('badgeId') badgeId: string, @Body('userId') userId: string) {
    return this.socialService.awardBadge(userId, badgeId);
  }

  /**
   * Get leaderboard
   * GET /social/leaderboard/:category
   */
  @Get('leaderboard/:category')
  async getLeaderboard(
    @Param('category') category: string,
    @Query('period') period?: string,
    @Query('limit') limit?: number,
  ) {
    return this.socialService.getLeaderboard(
      category,
      period || 'all_time',
      limit ? parseInt(limit.toString(), 10) : 100,
    );
  }

  /**
   * Update leaderboard score
   * PUT /social/leaderboard/:userId
   */
  @Put('leaderboard/:userId')
  async updateLeaderboardScore(
    @Param('userId') userId: string,
    @Body('category') category: string,
    @Body('score') score: number,
    @Body('period') period?: string,
  ) {
    return this.socialService.updateLeaderboardScore(userId, category, score, period || 'all_time');
  }

  /**
   * Create a report
   * POST /social/reports
   */
  @Post('reports')
  async createReport(
    @Body('reporterId') reporterId: string,
    @Body('reportedId') reportedId: string,
    @Body('entityType') entityType: string,
    @Body('entityId') entityId: string,
    @Body('reason') reason: string,
    @Body('description') description?: string,
  ) {
    return this.moderationService.createReport(
      reporterId,
      reportedId,
      entityType,
      entityId,
      reason,
      description,
    );
  }

  /**
   * Get all reports
   * GET /social/reports
   */
  @Get('reports')
  async getReports(
    @Query('status') status?: string,
    @Query('entityType') entityType?: string,
    @Query('limit') limit?: number,
  ) {
    return this.moderationService.getReports(
      status,
      entityType,
      limit ? parseInt(limit.toString(), 10) : 100,
    );
  }

  /**
   * Get a single report
   * GET /social/reports/:reportId
   */
  @Get('reports/:reportId')
  async getReport(@Param('reportId') reportId: string) {
    return this.moderationService.getReport(reportId);
  }

  /**
   * Update report status
   * PUT /social/reports/:reportId
   */
  @Put('reports/:reportId')
  async updateReportStatus(
    @Param('reportId') reportId: string,
    @Body('status') status: string,
    @Body('reviewerId') reviewerId: string,
    @Body('resolution') resolution?: Record<string, unknown>,
  ) {
    return this.moderationService.updateReportStatus(reportId, status, reviewerId, resolution);
  }

  /**
   * Get moderation statistics
   * GET /social/moderation/stats
   */
  @Get('moderation/stats')
  async getModerationStats() {
    return this.moderationService.getModerationStats();
  }
}
