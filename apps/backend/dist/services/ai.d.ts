export declare const improveText: (text: string) => {
    original: string;
    suggestions: any[];
};
export declare const generateCaptions: (filePath: string) => Promise<string>;
interface Post {
    id: string;
    content: string;
    userId: string;
}
export declare class AdvancedRecommendationEngine {
    private recommender;
    constructor();
    train(posts: Post[], likedPosts: Post[]): void;
    getRecommendations(userId: string, posts: Post[]): (Post | undefined)[];
}
export {};
