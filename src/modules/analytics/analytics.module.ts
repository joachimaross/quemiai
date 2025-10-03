import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from '../../services/analytics.service';
import { CacheService } from '../../services/cache.service';

@Module({
  controllers: [AnalyticsController],
  providers: [AnalyticsService, CacheService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
