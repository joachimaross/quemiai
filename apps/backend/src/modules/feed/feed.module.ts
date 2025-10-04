import { Module } from '@nestjs/common';
import { FeedService } from './feed.service';
import { FeedController } from './feed.controller';
import { InstagramConnector } from '../integrations/instagram/instagram.connector';
import { TikTokConnector } from '../integrations/tiktok/tiktok.connector';
import { FacebookConnector } from '../integrations/facebook/facebook.connector';
import { XConnector } from '../integrations/x/x.connector';

@Module({
  controllers: [FeedController],
  providers: [
    FeedService,
    InstagramConnector,
    TikTokConnector,
    FacebookConnector,
    XConnector,
  ],
  exports: [FeedService],
})
export class FeedModule {}
