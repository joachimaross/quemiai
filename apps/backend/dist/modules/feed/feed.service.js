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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedService = void 0;
const common_1 = require("@nestjs/common");
const instagram_connector_1 = require("../integrations/instagram/instagram.connector");
const tiktok_connector_1 = require("../integrations/tiktok/tiktok.connector");
const facebook_connector_1 = require("../integrations/facebook/facebook.connector");
const x_connector_1 = require("../integrations/x/x.connector");
let FeedService = class FeedService {
    constructor(instagramConnector, tiktokConnector, facebookConnector, xConnector) {
        this.instagramConnector = instagramConnector;
        this.tiktokConnector = tiktokConnector;
        this.facebookConnector = facebookConnector;
        this.xConnector = xConnector;
    }
    async getUnifiedFeed(userId, limit = 20) {
        try {
            const connections = await this.getUserConnections(userId);
            const feedPromises = [];
            for (const connection of connections) {
                switch (connection.platform) {
                    case 'instagram':
                        feedPromises.push(this.instagramConnector.fetchPosts(userId, connection.accessToken));
                        break;
                    case 'tiktok':
                        feedPromises.push(this.tiktokConnector.fetchPosts(userId, connection.accessToken));
                        break;
                    case 'facebook':
                        feedPromises.push(this.facebookConnector.fetchPosts(userId, connection.accessToken));
                        break;
                    case 'x':
                        feedPromises.push(this.xConnector.fetchPosts(userId, connection.accessToken));
                        break;
                }
            }
            const results = await Promise.allSettled(feedPromises);
            const allPosts = [];
            for (const result of results) {
                if (result.status === 'fulfilled') {
                    allPosts.push(...result.value);
                }
            }
            allPosts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            const paginatedPosts = allPosts.slice(0, limit);
            return {
                items: paginatedPosts,
                hasMore: allPosts.length > limit,
                nextCursor: allPosts.length > limit ? String(limit) : undefined,
            };
        }
        catch (error) {
            console.error('Error fetching unified feed:', error);
            throw error;
        }
    }
    async getUserConnections(userId) {
        return [
            { platform: 'instagram', accessToken: 'mock-ig-token' },
            { platform: 'tiktok', accessToken: 'mock-tt-token' },
            { platform: 'facebook', accessToken: 'mock-fb-token' },
            { platform: 'x', accessToken: 'mock-x-token' },
        ];
    }
};
exports.FeedService = FeedService;
exports.FeedService = FeedService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [instagram_connector_1.InstagramConnector,
        tiktok_connector_1.TikTokConnector,
        facebook_connector_1.FacebookConnector,
        x_connector_1.XConnector])
], FeedService);
//# sourceMappingURL=feed.service.js.map