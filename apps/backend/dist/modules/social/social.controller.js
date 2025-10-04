"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialController = void 0;
const common_1 = require("@nestjs/common");
const social_service_1 = require("./social.service");
const moderation_service_1 = require("./moderation.service");
let SocialController = class SocialController {
    constructor(socialService, moderationService) {
        this.socialService = socialService;
        this.moderationService = moderationService;
    }
    async getMutualFollowers(userId1, userId2) {
        return this.socialService.getMutualFollowers(userId1, userId2);
    }
    async getFriendSuggestions(userId, limit) {
        return this.socialService.getFriendSuggestions(userId, limit ? parseInt(limit.toString(), 10) : 10);
    }
    async generateFriendSuggestions(userId) {
        return this.socialService.generateFriendSuggestions(userId);
    }
    async dismissSuggestion(userId, suggestedUserId) {
        return this.socialService.dismissSuggestion(userId, suggestedUserId);
    }
    async getUserGroups(userId) {
        return this.socialService.getUserGroups(userId);
    }
    async createGroup(name, creatorId, description, isPrivate) {
        return this.socialService.createGroup(name, creatorId, description, isPrivate);
    }
    async joinGroup(groupId, userId) {
        return this.socialService.joinGroup(groupId, userId);
    }
    async leaveGroup(groupId, userId) {
        return this.socialService.leaveGroup(groupId, userId);
    }
    async getAllBadges() {
        return this.socialService.getAllBadges();
    }
    async getUserBadges(userId) {
        return this.socialService.getUserBadges(userId);
    }
    async awardBadge(badgeId, userId) {
        return this.socialService.awardBadge(userId, badgeId);
    }
    async getLeaderboard(category, period, limit) {
        return this.socialService.getLeaderboard(category, period || 'all_time', limit ? parseInt(limit.toString(), 10) : 100);
    }
    async updateLeaderboardScore(userId, category, score, period) {
        return this.socialService.updateLeaderboardScore(userId, category, score, period || 'all_time');
    }
    async createReport(reporterId, reportedId, entityType, entityId, reason, description) {
        return this.moderationService.createReport(reporterId, reportedId, entityType, entityId, reason, description);
    }
    async getReports(status, entityType, limit) {
        return this.moderationService.getReports(status, entityType, limit ? parseInt(limit.toString(), 10) : 100);
    }
    async getReport(reportId) {
        return this.moderationService.getReport(reportId);
    }
    async updateReportStatus(reportId, status, reviewerId, resolution) {
        return this.moderationService.updateReportStatus(reportId, status, reviewerId, resolution);
    }
    async getModerationStats() {
        return this.moderationService.getModerationStats();
    }
};
exports.SocialController = SocialController;
__decorate([
    (0, common_1.Get)('mutuals/:userId1/:userId2'),
    __param(0, (0, common_1.Param)('userId1')),
    __param(1, (0, common_1.Param)('userId2')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "getMutualFollowers", null);
__decorate([
    (0, common_1.Get)('suggestions/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "getFriendSuggestions", null);
__decorate([
    (0, common_1.Post)('suggestions/:userId/generate'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "generateFriendSuggestions", null);
__decorate([
    (0, common_1.Delete)('suggestions/:userId/:suggestedUserId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('suggestedUserId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "dismissSuggestion", null);
__decorate([
    (0, common_1.Get)('groups/user/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "getUserGroups", null);
__decorate([
    (0, common_1.Post)('groups'),
    __param(0, (0, common_1.Body)('name')),
    __param(1, (0, common_1.Body)('creatorId')),
    __param(2, (0, common_1.Body)('description')),
    __param(3, (0, common_1.Body)('isPrivate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Boolean]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "createGroup", null);
__decorate([
    (0, common_1.Post)('groups/:groupId/join'),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, common_1.Body)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "joinGroup", null);
__decorate([
    (0, common_1.Delete)('groups/:groupId/leave/:userId'),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "leaveGroup", null);
__decorate([
    (0, common_1.Get)('badges'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "getAllBadges", null);
__decorate([
    (0, common_1.Get)('badges/user/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "getUserBadges", null);
__decorate([
    (0, common_1.Post)('badges/:badgeId/award'),
    __param(0, (0, common_1.Param)('badgeId')),
    __param(1, (0, common_1.Body)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "awardBadge", null);
__decorate([
    (0, common_1.Get)('leaderboard/:category'),
    __param(0, (0, common_1.Param)('category')),
    __param(1, (0, common_1.Query)('period')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "getLeaderboard", null);
__decorate([
    (0, common_1.Put)('leaderboard/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)('category')),
    __param(2, (0, common_1.Body)('score')),
    __param(3, (0, common_1.Body)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, String]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "updateLeaderboardScore", null);
__decorate([
    (0, common_1.Post)('reports'),
    __param(0, (0, common_1.Body)('reporterId')),
    __param(1, (0, common_1.Body)('reportedId')),
    __param(2, (0, common_1.Body)('entityType')),
    __param(3, (0, common_1.Body)('entityId')),
    __param(4, (0, common_1.Body)('reason')),
    __param(5, (0, common_1.Body)('description')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "createReport", null);
__decorate([
    (0, common_1.Get)('reports'),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('entityType')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "getReports", null);
__decorate([
    (0, common_1.Get)('reports/:reportId'),
    __param(0, (0, common_1.Param)('reportId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "getReport", null);
__decorate([
    (0, common_1.Put)('reports/:reportId'),
    __param(0, (0, common_1.Param)('reportId')),
    __param(1, (0, common_1.Body)('status')),
    __param(2, (0, common_1.Body)('reviewerId')),
    __param(3, (0, common_1.Body)('resolution')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "updateReportStatus", null);
__decorate([
    (0, common_1.Get)('moderation/stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SocialController.prototype, "getModerationStats", null);
exports.SocialController = SocialController = __decorate([
    (0, common_1.Controller)('social'),
    __metadata("design:paramtypes", [social_service_1.SocialService,
        moderation_service_1.ModerationService])
], SocialController);
//# sourceMappingURL=social.controller.js.map