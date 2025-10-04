"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TikTokConnector = void 0;
const common_1 = require("@nestjs/common");
let TikTokConnector = class TikTokConnector {
    async fetchPosts(userId, accessToken) {
        return [
            {
                id: `tt-${Date.now()}-1`,
                content: 'Check out this awesome dance! 💃 #foryou #dance',
                platform: 'tiktok',
                user: '@tiktokuser',
                media: ['https://picsum.photos/300/400'],
                timestamp: new Date().toISOString(),
                likes: 5678,
                comments: 234,
                shares: 89,
                externalId: 'tt_video_456',
                externalUrl: 'https://tiktok.com/@user/video/example',
            },
        ];
    }
    async fetchDirectMessages(userId, accessToken) {
        return [];
    }
};
exports.TikTokConnector = TikTokConnector;
exports.TikTokConnector = TikTokConnector = __decorate([
    (0, common_1.Injectable)()
], TikTokConnector);
//# sourceMappingURL=tiktok.connector.js.map