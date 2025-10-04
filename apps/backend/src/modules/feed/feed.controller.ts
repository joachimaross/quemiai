import { Controller, Get, Query, Req } from '@nestjs/common';
import { FeedService } from './feed.service';

@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  /**
   * GET /feed
   * Returns unified feed from all connected platforms
   */
  @Get()
  async getFeed(@Req() req: any, @Query('limit') limit?: string) {
    // TODO: Extract user ID from JWT token in request
    const userId = req.user?.id || 'mock-user-id';
    const feedLimit = limit ? parseInt(limit, 10) : 20;

    return this.feedService.getUnifiedFeed(userId, feedLimit);
  }
}
