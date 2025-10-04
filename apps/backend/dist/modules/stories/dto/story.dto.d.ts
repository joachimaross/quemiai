export declare class CreateStoryDto {
    authorId: string;
    mediaUrl: string;
    audioUrl?: string;
    expiresAt?: string;
}
export declare class StoryResponseDto {
    id: string;
    authorId: string;
    mediaUrl: string;
    audioUrl?: string;
    createdAt: Date;
    expiresAt: Date;
    author?: {
        id: string;
        name: string;
        avatar?: string;
    };
}
export declare class StoryReactionDto {
    storyId: string;
    userId: string;
    emoji: string;
}
export declare class StoryReplyDto {
    storyId: string;
    userId: string;
    content: string;
}
