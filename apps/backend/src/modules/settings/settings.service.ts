import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class SettingsService {
  private readonly prisma = new PrismaClient();
  private readonly logger = new Logger(SettingsService.name);

  /**
   * Get user settings (creates default if doesn't exist)
   */
  async getUserSettings(userId: string) {
    let settings = await this.prisma.userSettings.findUnique({
      where: { userId },
    });

    // Create default settings if they don't exist
    if (!settings) {
      settings = await this.prisma.userSettings.create({
        data: { userId },
      });
      this.logger.log(`Created default settings for user ${userId}`);
    }

    return settings;
  }

  /**
   * Update user settings
   */
  async updateUserSettings(
    userId: string,
    updates: Partial<{
      // Notification preferences
      emailNotifications: boolean;
      pushNotifications: boolean;
      smsNotifications: boolean;
      notifyOnLikes: boolean;
      notifyOnComments: boolean;
      notifyOnFollows: boolean;
      notifyOnMentions: boolean;
      notifyOnMessages: boolean;
      // Privacy settings
      profileVisibility: string;
      showEmail: boolean;
      showPhone: boolean;
      allowTagging: boolean;
      allowMessagesFrom: string;
      // Content preferences
      autoplayVideos: boolean;
      highQualityUploads: boolean;
      saveDataMode: boolean;
      // AI & Personalization
      enableAiRecommendations: boolean;
      enableSmartReplies: boolean;
      enableContentFiltering: boolean;
      // Theme & Display
      theme: string;
      fontSize: string;
      highContrast: boolean;
      reduceMotion: boolean;
      // Language & Region
      language: string;
      timezone: string;
    }>,
  ) {
    const settings = await this.prisma.userSettings.upsert({
      where: { userId },
      update: updates,
      create: {
        userId,
        ...updates,
      },
    });

    this.logger.log(`Updated settings for user ${userId}`);
    return settings;
  }

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(
    userId: string,
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
    return this.updateUserSettings(userId, preferences);
  }

  /**
   * Update privacy settings
   */
  async updatePrivacySettings(
    userId: string,
    privacy: {
      profileVisibility?: string;
      showEmail?: boolean;
      showPhone?: boolean;
      allowTagging?: boolean;
      allowMessagesFrom?: string;
    },
  ) {
    return this.updateUserSettings(userId, privacy);
  }

  /**
   * Update theme settings
   */
  async updateThemeSettings(
    userId: string,
    theme: {
      theme?: string;
      fontSize?: string;
      highContrast?: boolean;
      reduceMotion?: boolean;
    },
  ) {
    return this.updateUserSettings(userId, theme);
  }

  /**
   * Update AI settings
   */
  async updateAiSettings(
    userId: string,
    ai: {
      enableAiRecommendations?: boolean;
      enableSmartReplies?: boolean;
      enableContentFiltering?: boolean;
    },
  ) {
    return this.updateUserSettings(userId, ai);
  }

  /**
   * Reset settings to defaults
   */
  async resetToDefaults(userId: string) {
    const settings = await this.prisma.userSettings.upsert({
      where: { userId },
      update: {
        // Notification preferences
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        notifyOnLikes: true,
        notifyOnComments: true,
        notifyOnFollows: true,
        notifyOnMentions: true,
        notifyOnMessages: true,
        // Privacy settings
        profileVisibility: 'public',
        showEmail: false,
        showPhone: false,
        allowTagging: true,
        allowMessagesFrom: 'everyone',
        // Content preferences
        autoplayVideos: true,
        highQualityUploads: true,
        saveDataMode: false,
        // AI & Personalization
        enableAiRecommendations: true,
        enableSmartReplies: true,
        enableContentFiltering: true,
        // Theme & Display
        theme: 'system',
        fontSize: 'medium',
        highContrast: false,
        reduceMotion: false,
        // Language & Region
        language: 'en',
        timezone: 'UTC',
      },
      create: { userId },
    });

    this.logger.log(`Reset settings to defaults for user ${userId}`);
    return settings;
  }

  /**
   * Delete user settings
   */
  async deleteUserSettings(userId: string) {
    const settings = await this.prisma.userSettings.findUnique({
      where: { userId },
    });

    if (!settings) {
      throw new NotFoundException(`Settings for user ${userId} not found`);
    }

    await this.prisma.userSettings.delete({
      where: { userId },
    });

    this.logger.log(`Deleted settings for user ${userId}`);
    return { message: 'Settings deleted successfully' };
  }
}
