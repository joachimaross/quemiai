"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var StoriesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoriesService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let StoriesService = StoriesService_1 = class StoriesService {
    constructor() {
        this.prisma = new client_1.PrismaClient();
        this.logger = new common_1.Logger(StoriesService_1.name);
    }
    async createStory(createStoryDto) {
        const expiresAt = createStoryDto.expiresAt
            ? new Date(createStoryDto.expiresAt)
            : new Date(Date.now() + 24 * 60 * 60 * 1000);
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
    async getActiveStories(userId) {
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
    async getStoryById(storyId) {
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
            throw new common_1.NotFoundException(`Story with ID ${storyId} not found`);
        }
        return story;
    }
    async deleteStory(storyId, userId) {
        const story = await this.prisma.story.findUnique({
            where: { id: storyId },
        });
        if (!story) {
            throw new common_1.NotFoundException(`Story with ID ${storyId} not found`);
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
    async addReaction(storyId, userId, emoji) {
        const story = await this.prisma.story.findUnique({
            where: { id: storyId },
        });
        if (!story) {
            throw new common_1.NotFoundException(`Story with ID ${storyId} not found`);
        }
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
    async removeReaction(storyId, userId, emoji) {
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
            throw new common_1.NotFoundException('Reaction not found');
        }
        await this.prisma.storyReaction.delete({
            where: {
                id: reaction.id,
            },
        });
        this.logger.log(`Reaction removed from story ${storyId} by user ${userId}`);
        return { message: 'Reaction removed successfully' };
    }
    async addReply(storyId, userId, content) {
        const story = await this.prisma.story.findUnique({
            where: { id: storyId },
        });
        if (!story) {
            throw new common_1.NotFoundException(`Story with ID ${storyId} not found`);
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
    async getStoryReplies(storyId) {
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
};
exports.StoriesService = StoriesService;
exports.StoriesService = StoriesService = StoriesService_1 = __decorate([
    (0, common_1.Injectable)()
], StoriesService);
//# sourceMappingURL=stories.service.js.map