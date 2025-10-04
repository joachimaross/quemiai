import { StoriesService } from './stories.service';
import { CreateStoryDto } from './dto/story.dto';
export declare class StoriesController {
    private readonly storiesService;
    constructor(storiesService: StoriesService);
    createStory(createStoryDto: CreateStoryDto): Promise<any>;
    getActiveStories(userId?: string): Promise<any>;
    getStoryById(id: string): Promise<any>;
    deleteStory(id: string, userId: string): Promise<{
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
