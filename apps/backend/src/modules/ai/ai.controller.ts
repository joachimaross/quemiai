import { Controller, Post, Body, Req } from '@nestjs/common';
import { AiService, AIChatRequest, AICaptionRequest } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  /**
   * POST /ai/chat
   * Chat with QuemiAi assistant
   */
  @Post('chat')
  async chat(@Body() request: AIChatRequest) {
    return this.aiService.chat(request);
  }

  /**
   * POST /ai/caption
   * Generate social media caption
   */
  @Post('caption')
  async generateCaption(@Body() request: AICaptionRequest) {
    return this.aiService.generateCaption(request);
  }
}
