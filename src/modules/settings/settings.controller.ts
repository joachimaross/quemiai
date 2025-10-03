import { Controller, Get, Put, Delete, Body, Param } from '@nestjs/common';
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  /**
   * Get user settings
   * GET /settings/:userId
   */
  @Get(':userId')
  async getUserSettings(@Param('userId') userId: string) {
    return this.settingsService.getUserSettings(userId);
  }

  /**
   * Update user settings
   * PUT /settings/:userId
   */
  @Put(':userId')
  async updateUserSettings(
    @Param('userId') userId: string,
    @Body() updates: Record<string, unknown>,
  ) {
    return this.settingsService.updateUserSettings(userId, updates);
  }

  /**
   * Update notification preferences
   * PUT /settings/:userId/notifications
   */
  @Put(':userId/notifications')
  async updateNotificationPreferences(
    @Param('userId') userId: string,
    @Body()
    preferences: {
      emailNotifications?: boolean;
      pushNotifications?: boolean;
      smsNotifications?: boolean;
      notifyOnLikes?: boolean;
      notifyOnComments?: boolean;
      notifyOnFollows?: boolean;
      notifyOnMentions?: boolean;
      notifyOnMessages?: boolean;
    },
  ) {
    return this.settingsService.updateNotificationPreferences(
      userId,
      preferences,
    );
  }

  /**
   * Update privacy settings
   * PUT /settings/:userId/privacy
   */
  @Put(':userId/privacy')
  async updatePrivacySettings(
    @Param('userId') userId: string,
    @Body()
    privacy: {
      profileVisibility?: string;
      showEmail?: boolean;
      showPhone?: boolean;
      allowTagging?: boolean;
      allowMessagesFrom?: string;
    },
  ) {
    return this.settingsService.updatePrivacySettings(userId, privacy);
  }

  /**
   * Update theme settings
   * PUT /settings/:userId/theme
   */
  @Put(':userId/theme')
  async updateThemeSettings(
    @Param('userId') userId: string,
    @Body()
    theme: {
      theme?: string;
      fontSize?: string;
      highContrast?: boolean;
      reduceMotion?: boolean;
    },
  ) {
    return this.settingsService.updateThemeSettings(userId, theme);
  }

  /**
   * Update AI settings
   * PUT /settings/:userId/ai
   */
  @Put(':userId/ai')
  async updateAiSettings(
    @Param('userId') userId: string,
    @Body()
    ai: {
      enableAiRecommendations?: boolean;
      enableSmartReplies?: boolean;
      enableContentFiltering?: boolean;
    },
  ) {
    return this.settingsService.updateAiSettings(userId, ai);
  }

  /**
   * Reset settings to defaults
   * PUT /settings/:userId/reset
   */
  @Put(':userId/reset')
  async resetToDefaults(@Param('userId') userId: string) {
    return this.settingsService.resetToDefaults(userId);
  }

  /**
   * Delete user settings
   * DELETE /settings/:userId
   */
  @Delete(':userId')
  async deleteUserSettings(@Param('userId') userId: string) {
    return this.settingsService.deleteUserSettings(userId);
  }
}
