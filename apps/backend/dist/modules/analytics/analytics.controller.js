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
exports.AnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const analytics_service_1 = require("../../services/analytics.service");
let AnalyticsController = class AnalyticsController {
    constructor(analyticsService) {
        this.analyticsService = analyticsService;
    }
    async trackEvent(eventType, entityType, entityId, userId, metadata, ipAddress, userAgent) {
        await this.analyticsService.trackEvent(eventType, entityType, entityId, userId, metadata, ipAddress, userAgent);
        return { success: true };
    }
    async getPostAnalytics(postId) {
        return this.analyticsService.getPostAnalytics(postId);
    }
    async updatePostAnalytics(postId, views, likes, comments, shares) {
        return this.analyticsService.updatePostAnalytics(postId, {
            views,
            likes,
            comments,
            shares,
        });
    }
    async getUserAnalytics(userId) {
        return this.analyticsService.getUserAnalytics(userId);
    }
    async calculateUserAnalytics(userId) {
        return this.analyticsService.calculateUserAnalytics(userId);
    }
    async getUserTopPosts(userId, limit) {
        return this.analyticsService.getUserTopPosts(userId, limit ? parseInt(limit.toString(), 10) : 10);
    }
    async getAnalyticsSummary(userId, startDate, endDate) {
        return this.analyticsService.getAnalyticsSummary(userId, new Date(startDate), new Date(endDate));
    }
    async getEntityEvents(entityType, entityId, eventType, limit) {
        return this.analyticsService.getEntityEvents(entityType, entityId, eventType, limit ? parseInt(limit.toString(), 10) : 100);
    }
};
exports.AnalyticsController = AnalyticsController;
__decorate([
    (0, common_1.Post)('events'),
    __param(0, (0, common_1.Body)('eventType')),
    __param(1, (0, common_1.Body)('entityType')),
    __param(2, (0, common_1.Body)('entityId')),
    __param(3, (0, common_1.Body)('userId')),
    __param(4, (0, common_1.Body)('metadata')),
    __param(5, (0, common_1.Body)('ipAddress')),
    __param(6, (0, common_1.Body)('userAgent')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Object, String, String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "trackEvent", null);
__decorate([
    (0, common_1.Get)('posts/:postId'),
    __param(0, (0, common_1.Param)('postId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getPostAnalytics", null);
__decorate([
    (0, common_1.Post)('posts/:postId'),
    __param(0, (0, common_1.Param)('postId')),
    __param(1, (0, common_1.Body)('views')),
    __param(2, (0, common_1.Body)('likes')),
    __param(3, (0, common_1.Body)('comments')),
    __param(4, (0, common_1.Body)('shares')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, Number, Number]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "updatePostAnalytics", null);
__decorate([
    (0, common_1.Get)('users/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getUserAnalytics", null);
__decorate([
    (0, common_1.Post)('users/:userId/calculate'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "calculateUserAnalytics", null);
__decorate([
    (0, common_1.Get)('users/:userId/top-posts'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getUserTopPosts", null);
__decorate([
    (0, common_1.Get)('users/:userId/summary'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getAnalyticsSummary", null);
__decorate([
    (0, common_1.Get)('events/:entityType/:entityId'),
    __param(0, (0, common_1.Param)('entityType')),
    __param(1, (0, common_1.Param)('entityId')),
    __param(2, (0, common_1.Query)('eventType')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Number]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getEntityEvents", null);
exports.AnalyticsController = AnalyticsController = __decorate([
    (0, common_1.Controller)('analytics'),
    __metadata("design:paramtypes", [analytics_service_1.AnalyticsService])
], AnalyticsController);
//# sourceMappingURL=analytics.controller.js.map