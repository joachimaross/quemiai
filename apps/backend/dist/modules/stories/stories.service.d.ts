import { CreateStoryDto } from './dto/story.dto';
export declare class StoriesService {
    private readonly prisma;
    private readonly logger;
    createStory(createStoryDto: CreateStoryDto): Promise<any>;
    getActiveStories(userId?: string): Promise<any>;
    getStoryById(storyId: string): Promise<any>;
    deleteStory(storyId: string, userId: string): Promise<{
        message: string;
    }>;
    addReaction(storyId: string, userId: string, emoji: string): Promise<any>;
    removeReaction(storyId: string, userId: string, emoji: string): Promise<{
        message: string;
    }>;
    addReply(storyId: string, userId: string, content: string): Promise<any>;
    getStoryReplies(storyId: string): Promise<any>;
    cleanupExpiredStories(): Promise<{
        deletedCount: any;
    }>;
}
