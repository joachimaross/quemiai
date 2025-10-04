import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { StoriesService } from './stories.service';
import { CreateStoryDto } from './dto/story.dto';

@Controller('stories')
export class StoriesController {
  constructor(private readonly storiesService: StoriesService) {}

  /**
   * Create a new story
   * POST /stories
   */
  @Post()
  async createStory(@Body() createStoryDto: CreateStoryDto) {
    return this.storiesService.createStory(createStoryDto);
  }

  /**
   * Get all active stories
   * GET /stories
   */
  @Get()
  async getActiveStories(@Query('userId') userId?: string) {
    return this.storiesService.getActiveStories(userId);
  }

  /**
   * Get a specific story by ID
   * GET /stories/:id
   */
  @Get(':id')
  async getStoryById(@Param('id') id: string) {
    return this.storiesService.getStoryById(id);
  }

  /**
   * Delete a story
   * DELETE /stories/:id
   */
  @Delete(':id')
  async deleteStory(@Param('id') id: string, @Body('userId') userId: string) {
    return this.storiesService.deleteStory(id, userId);
  }

  /**
   * Add a reaction to a story
   * POST /stories/:id/reactions
   */
  @Post(':id/reactions')
  async addReaction(
    @Param('id') storyId: string,
    @Body('userId') userId: string,
    @Body('emoji') emoji: string,
  ) {
    return this.storiesService.addReaction(storyId, userId, emoji);
  }

  /**
   * Remove a reaction from a story
   * DELETE /stories/:id/reactions
   */
  @Delete(':id/reactions')
  async removeReaction(
    @Param('id') storyId: string,
    @Query('userId') userId: string,
    @Query('emoji') emoji: string,
  ) {
    return this.storiesService.removeReaction(storyId, userId, emoji);
  }

  /**
   * Add a reply to a story
   * POST /stories/:id/replies
   */
  @Post(':id/replies')
  async addReply(
    @Param('id') storyId: string,
    @Body('userId') userId: string,
    @Body('content') content: string,
  ) {
    return this.storiesService.addReply(storyId, userId, content);
  }

  /**
   * Get replies for a story
   * GET /stories/:id/replies
   */
  @Get(':id/replies')
  async getStoryReplies(@Param('id') storyId: string) {
    return this.storiesService.getStoryReplies(storyId);
  }

  /**
   * Clean up expired stories (maintenance endpoint)
   * POST /stories/cleanup
   */
  @Post('cleanup')
  async cleanupExpiredStories() {
    return this.storiesService.cleanupExpiredStories();
  }
}
