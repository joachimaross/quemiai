import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class SocialService {
  private readonly prisma = new PrismaClient();
  private readonly logger = new Logger(SocialService.name);

  /**
   * Get mutual followers between two users
   */
  async getMutualFollowers(userId1: string, userId2: string) {
    // Get followers of userId1
    const followers1 = await this.prisma.follower.findMany({
      where: { followingId: userId1 },
      select: { followerId: true },
    });

    // Get followers of userId2
    const followers2 = await this.prisma.follower.findMany({
      where: { followingId: userId2 },
      select: { followerId: true },
    });

    const followerIds1 = followers1.map((f) => f.followerId);
    const followerIds2 = followers2.map((f) => f.followerId);

    // Find mutual follower IDs
    const mutualIds = followerIds1.filter((id) => followerIds2.includes(id));

    // Get user details for mutual followers
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

  /**
   * Get friend suggestions for a user
   */
  async getFriendSuggestions(userId: string, limit: number = 10) {
    // Get existing suggestions that haven't been dismissed
    const suggestions = await this.prisma.friendSuggestion.findMany({
      where: {
        userId,
        dismissed: false,
      },
      orderBy: { score: 'desc' },
      take: limit,
    });

    // Get user details for suggestions
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

  /**
   * Generate friend suggestions based on mutual connections
   */
  async generateFriendSuggestions(userId: string) {
    // Get user's followers (people who follow them)
    const followers = await this.prisma.follower.findMany({
      where: { followingId: userId },
      select: { followerId: true },
    });

    // Get user's following (people they follow)
    const following = await this.prisma.follower.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });

    const followerIds = followers.map((f) => f.followerId);
    const followingIds = following.map((f) => f.followingId);
    const connectedIds = [...followerIds, ...followingIds];

    // Find people who are connected to user's connections (friends of friends)
    const friendsOfFriends = await this.prisma.follower.findMany({
      where: {
        followerId: { in: connectedIds },
        followingId: { notIn: [userId, ...connectedIds] },
      },
      select: { followingId: true },
    });

    // Count occurrences to calculate score
    const suggestionScores = new Map<string, number>();
    friendsOfFriends.forEach((f) => {
      const count = suggestionScores.get(f.followingId) || 0;
      suggestionScores.set(f.followingId, count + 1);
    });

    // Create or update suggestions
    const promises = Array.from(suggestionScores.entries()).map(
      async ([suggestedUserId, count]) => {
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
      },
    );

    await Promise.all(promises);

    this.logger.log(`Generated ${suggestionScores.size} friend suggestions for user ${userId}`);
    return { generatedCount: suggestionScores.size };
  }

  /**
   * Dismiss a friend suggestion
   */
  async dismissSuggestion(userId: string, suggestedUserId: string) {
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

  /**
   * Get user's groups
   */
  async getUserGroups(userId: string) {
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

  /**
   * Create a group
   */
  async createGroup(
    name: string,
    creatorId: string,
    description?: string,
    isPrivate: boolean = false,
  ) {
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

  /**
   * Join a group
   */
  async joinGroup(groupId: string, userId: string) {
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
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

  /**
   * Leave a group
   */
  async leaveGroup(groupId: string, userId: string) {
    const membership = await this.prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });

    if (!membership) {
      throw new NotFoundException('Group membership not found');
    }

    await this.prisma.groupMember.delete({
      where: {
        id: membership.id,
      },
    });

    this.logger.log(`User ${userId} left group ${groupId}`);
    return { success: true };
  }

  /**
   * Get all badges
   */
  async getAllBadges() {
    return this.prisma.badge.findMany({
      orderBy: [{ category: 'asc' }, { rarity: 'desc' }],
    });
  }

  /**
   * Get user's badges
   */
  async getUserBadges(userId: string) {
    const userBadges = await this.prisma.userBadge.findMany({
      where: { userId },
      include: {
        badge: true,
      },
      orderBy: { earnedAt: 'desc' },
    });

    return userBadges;
  }

  /**
   * Award a badge to a user
   */
  async awardBadge(userId: string, badgeId: string) {
    const badge = await this.prisma.badge.findUnique({
      where: { id: badgeId },
    });

    if (!badge) {
      throw new NotFoundException('Badge not found');
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

  /**
   * Get leaderboard
   */
  async getLeaderboard(category: string, period: string = 'all_time', limit: number = 100) {
    const leaderboard = await this.prisma.leaderboard.findMany({
      where: {
        category,
        period,
      },
      orderBy: { score: 'desc' },
      take: limit,
    });

    // Get user details
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

  /**
   * Update user leaderboard score
   */
  async updateLeaderboardScore(
    userId: string,
    category: string,
    score: number,
    period: string = 'all_time',
  ) {
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
}
