"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.XConnector = void 0;
const common_1 = require("@nestjs/common");
let XConnector = class XConnector {
    async fetchPosts(userId, accessToken) {
        return [
            {
                id: `x-${Date.now()}-1`,
                content: 'Just launched our new product! 🚀 Check it out! #startup #tech',
                platform: 'x',
                user: '@techfounder',
                media: [],
                timestamp: new Date().toISOString(),
                likes: 234,
                comments: 45,
                shares: 67,
                externalId: 'x_tweet_321',
                externalUrl: 'https://x.com/user/status/example',
            },
        ];
    }
    async fetchDirectMessages(userId, accessToken) {
        return [];
    }
};
exports.XConnector = XConnector;
exports.XConnector = XConnector = __decorate([
    (0, common_1.Injectable)()
], XConnector);
//# sourceMappingURL=x.connector.js.map