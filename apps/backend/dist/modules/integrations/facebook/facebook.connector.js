"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FacebookConnector = void 0;
const common_1 = require("@nestjs/common");
let FacebookConnector = class FacebookConnector {
    async fetchPosts(userId, accessToken) {
        return [
            {
                id: `fb-${Date.now()}-1`,
                content: 'Had a great time at the conference today! 📊',
                platform: 'facebook',
                user: 'John Doe',
                media: ['https://picsum.photos/500/300'],
                timestamp: new Date().toISOString(),
                likes: 89,
                comments: 12,
                shares: 5,
                externalId: 'fb_post_789',
                externalUrl: 'https://facebook.com/user/posts/example',
            },
        ];
    }
    async fetchDirectMessages(userId, accessToken) {
        return [];
    }
};
exports.FacebookConnector = FacebookConnector;
exports.FacebookConnector = FacebookConnector = __decorate([
    (0, common_1.Injectable)()
], FacebookConnector);
//# sourceMappingURL=facebook.connector.js.map