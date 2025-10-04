import { FeedService } from './feed.service';
export declare class FeedController {
    private readonly feedService;
    constructor(feedService: FeedService);
    getFeed(req: any, limit?: string): Promise<import("./feed.service").UnifiedFeedResponse>;
}
