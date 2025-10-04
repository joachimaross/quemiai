"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedModule = void 0;
const common_1 = require("@nestjs/common");
const feed_service_1 = require("./feed.service");
const feed_controller_1 = require("./feed.controller");
const instagram_connector_1 = require("../integrations/instagram/instagram.connector");
const tiktok_connector_1 = require("../integrations/tiktok/tiktok.connector");
const facebook_connector_1 = require("../integrations/facebook/facebook.connector");
const x_connector_1 = require("../integrations/x/x.connector");
let FeedModule = class FeedModule {
};
exports.FeedModule = FeedModule;
exports.FeedModule = FeedModule = __decorate([
    (0, common_1.Module)({
        controllers: [feed_controller_1.FeedController],
        providers: [feed_service_1.FeedService, instagram_connector_1.InstagramConnector, tiktok_connector_1.TikTokConnector, facebook_connector_1.FacebookConnector, x_connector_1.XConnector],
        exports: [feed_service_1.FeedService],
    })
], FeedModule);
//# sourceMappingURL=feed.module.js.map