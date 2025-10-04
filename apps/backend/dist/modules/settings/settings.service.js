"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var SettingsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let SettingsService = SettingsService_1 = class SettingsService {
    constructor() {
        this.prisma = new client_1.PrismaClient();
        this.logger = new common_1.Logger(SettingsService_1.name);
    }
    async getUserSettings(userId) {
        let settings = await this.prisma.userSettings.findUnique({
            where: { userId },
        });
        if (!settings) {
            settings = await this.prisma.userSettings.create({
                data: { userId },
            });
            this.logger.log(`Created default settings for user ${userId}`);
        }
        return settings;
    }
    async updateUserSettings(userId, updates) {
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
    async updateNotificationPreferences(userId, preferences) {
        return this.updateUserSettings(userId, preferences);
    }
    async updatePrivacySettings(userId, privacy) {
        return this.updateUserSettings(userId, privacy);
    }
    async updateThemeSettings(userId, theme) {
        return this.updateUserSettings(userId, theme);
    }
    async updateAiSettings(userId, ai) {
        return this.updateUserSettings(userId, ai);
    }
    async resetToDefaults(userId) {
        const settings = await this.prisma.userSettings.upsert({
            where: { userId },
            update: {
                emailNotifications: true,
                pushNotifications: true,
                smsNotifications: false,
                notifyOnLikes: true,
                notifyOnComments: true,
                notifyOnFollows: true,
                notifyOnMentions: true,
                notifyOnMessages: true,
                profileVisibility: 'public',
                showEmail: false,
                showPhone: false,
                allowTagging: true,
                allowMessagesFrom: 'everyone',
                autoplayVideos: true,
                highQualityUploads: true,
                saveDataMode: false,
                enableAiRecommendations: true,
                enableSmartReplies: true,
                enableContentFiltering: true,
                theme: 'system',
                fontSize: 'medium',
                highContrast: false,
                reduceMotion: false,
                language: 'en',
                timezone: 'UTC',
            },
            create: { userId },
        });
        this.logger.log(`Reset settings to defaults for user ${userId}`);
        return settings;
    }
    async deleteUserSettings(userId) {
        const settings = await this.prisma.userSettings.findUnique({
            where: { userId },
        });
        if (!settings) {
            throw new common_1.NotFoundException(`Settings for user ${userId} not found`);
        }
        await this.prisma.userSettings.delete({
            where: { userId },
        });
        this.logger.log(`Deleted settings for user ${userId}`);
        return { message: 'Settings deleted successfully' };
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = SettingsService_1 = __decorate([
    (0, common_1.Injectable)()
], SettingsService);
//# sourceMappingURL=settings.service.js.map