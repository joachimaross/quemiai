import { SettingsService } from './settings.service';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    getUserSettings(userId: string): Promise<any>;
    updateUserSettings(userId: string, updates: Record<string, unknown>): Promise<any>;
    updateNotificationPreferences(userId: string, preferences: {
        emailNotifications?: boolean;
        pushNotifications?: boolean;
        smsNotifications?: boolean;
        notifyOnLikes?: boolean;
        notifyOnComments?: boolean;
        notifyOnFollows?: boolean;
        notifyOnMentions?: boolean;
        notifyOnMessages?: boolean;
    }): Promise<any>;
    updatePrivacySettings(userId: string, privacy: {
        profileVisibility?: string;
        showEmail?: boolean;
        showPhone?: boolean;
        allowTagging?: boolean;
        allowMessagesFrom?: string;
    }): Promise<any>;
    updateThemeSettings(userId: string, theme: {
        theme?: string;
        fontSize?: string;
        highContrast?: boolean;
        reduceMotion?: boolean;
    }): Promise<any>;
    updateAiSettings(userId: string, ai: {
        enableAiRecommendations?: boolean;
        enableSmartReplies?: boolean;
        enableContentFiltering?: boolean;
    }): Promise<any>;
    resetToDefaults(userId: string): Promise<any>;
    deleteUserSettings(userId: string): Promise<{
        message: string;
    }>;
}
