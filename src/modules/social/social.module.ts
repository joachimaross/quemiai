import { Module } from '@nestjs/common';
import { SocialController } from './social.controller';
import { SocialService } from './social.service';
import { ModerationService } from './moderation.service';

@Module({
  controllers: [SocialController],
  providers: [SocialService, ModerationService],
  exports: [SocialService, ModerationService],
})
export class SocialModule {}
