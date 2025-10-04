"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstagramConnector = void 0;
const common_1 = require("@nestjs/common");
let InstagramConnector = class InstagramConnector {
    async fetchPosts(userId, accessToken) {
        return [
            {
                id: `ig-${Date.now()}-1`,
                content: 'Beautiful sunset at the beach! 🌅 #travel #sunset',
                platform: 'instagram',
                user: '@johndoe',
                media: ['https://picsum.photos/400/400'],
                timestamp: new Date().toISOString(),
                likes: 1234,
                comments: 56,
                shares: 12,
                externalId: 'ig_post_123',
                externalUrl: 'https://instagram.com/p/example',
            },
        ];
    }
    async fetchDirectMessages(userId, accessToken) {
        return [];
    }
};
exports.InstagramConnector = InstagramConnector;
exports.InstagramConnector = InstagramConnector = __decorate([
    (0, common_1.Injectable)()
], InstagramConnector);
//# sourceMappingURL=instagram.connector.js.map