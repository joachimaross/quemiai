import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateStoryDto } from './dto/story.dto';

@Injectable()
export class StoriesService {
  private readonly prisma = new PrismaClient();
  private readonly logger = new Logger(StoriesService.name);

  /**
   * Create a new story
   */
  async createStory(createStoryDto: CreateStoryDto) {
    const expiresAt = createStoryDto.expiresAt
      ? new Date(createStoryDto.expiresAt)
      : new Date(Date.now() + 24 * 60 * 60 * 1000); // Default 24 hours

    const story = await this.prisma.story.create({
      data: {
        authorId: createStoryDto.authorId,
        mediaUrl: createStoryDto.mediaUrl,
        audioUrl: createStoryDto.audioUrl,
        expiresAt,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    this.logger.log(`Story created: ${story.id} by user ${createStoryDto.authorId}`);
    return story;
  }

  /**
   * Get all active stories (not expired)
   */
  async getActiveStories(userId?: string) {
    const now = new Date();
    const stories = await this.prisma.story.findMany({
      where: {
        expiresAt: {
          gt: now,
        },
        ...(userId && { authorId: userId }),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        reactions: {
          select: {
            id: true,
            emoji: true,
            userId: true,
          },
        },
        _count: {
          select: {
            reactions: true,
            replies: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return stories;
  }

  /**
   * Get a single story by ID
   */
  async getStoryById(storyId: string) {
    const story = await this.prisma.story.findUnique({
      where: { id: storyId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!story) {
      throw new NotFoundException(`Story with ID ${storyId} not found`);
    }

    return story;
  }

  /**
   * Delete a story
   */
  async deleteStory(storyId: string, userId: string) {
    const story = await this.prisma.story.findUnique({
      where: { id: storyId },
    });

    if (!story) {
      throw new NotFoundException(`Story with ID ${storyId} not found`);
    }

    if (story.authorId !== userId) {
      throw new Error('Unauthorized to delete this story');
    }

    await this.prisma.story.delete({
      where: { id: storyId },
    });

    this.logger.log(`Story deleted: ${storyId}`);
    return { message: 'Story deleted successfully' };
  }

  /**
   * Add a reaction to a story
   */
  async addReaction(storyId: string, userId: string, emoji: string) {
    // Check if story exists
    const story = await this.prisma.story.findUnique({
      where: { id: storyId },
    });

    if (!story) {
      throw new NotFoundException(`Story with ID ${storyId} not found`);
    }

    // Create or update reaction
    const reaction = await this.prisma.storyReaction.upsert({
      where: {
        storyId_userId_emoji: {
          storyId,
          userId,
          emoji,
        },
      },
      update: {},
      create: {
        storyId,
        userId,
        emoji,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    this.logger.log(`Reaction added to story ${storyId} by user ${userId}`);
    return reaction;
  }

  /**
   * Remove a reaction from a story
   */
  async removeReaction(storyId: string, userId: string, emoji: string) {
    const reaction = await this.prisma.storyReaction.findUnique({
      where: {
        storyId_userId_emoji: {
          storyId,
          userId,
          emoji,
        },
      },
    });

    if (!reaction) {
      throw new NotFoundException('Reaction not found');
    }

    await this.prisma.storyReaction.delete({
      where: {
        id: reaction.id,
      },
    });

    this.logger.log(`Reaction removed from story ${storyId} by user ${userId}`);
    return { message: 'Reaction removed successfully' };
  }

  /**
   * Add a reply to a story
   */
  async addReply(storyId: string, userId: string, content: string) {
    // Check if story exists
    const story = await this.prisma.story.findUnique({
      where: { id: storyId },
    });

    if (!story) {
      throw new NotFoundException(`Story with ID ${storyId} not found`);
    }

    const reply = await this.prisma.storyReply.create({
      data: {
        storyId,
        userId,
        content,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    this.logger.log(`Reply added to story ${storyId} by user ${userId}`);
    return reply;
  }

  /**
   * Get replies for a story
   */
  async getStoryReplies(storyId: string) {
    const replies = await this.prisma.storyReply.findMany({
      where: { storyId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return replies;
  }

  /**
   * Clean up expired stories (can be called periodically)
   */
  async cleanupExpiredStories() {
    const now = new Date();
    const result = await this.prisma.story.deleteMany({
      where: {
        expiresAt: {
          lt: now,
        },
      },
    });

    this.logger.log(`Cleaned up ${result.count} expired stories`);
    return { deletedCount: result.count };
  }
}
