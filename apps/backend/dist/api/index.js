"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const users_1 = __importDefault(require("./users"));
const posts_1 = __importDefault(require("./posts"));
const messages_1 = __importDefault(require("./messages"));
const analytics_1 = __importDefault(require("./analytics"));
const marketplace_1 = __importDefault(require("./marketplace"));
const ai_1 = __importDefault(require("./ai"));
const auth_1 = __importDefault(require("./auth"));
const social_media_1 = __importDefault(require("./social-media"));
const router = (0, express_1.Router)();
router.use('/users', users_1.default);
router.use('/posts', posts_1.default);
router.use('/messages', messages_1.default);
router.use('/analytics', analytics_1.default);
router.use('/marketplace', marketplace_1.default);
router.use('/ai', ai_1.default);
router.use('/auth', auth_1.default);
router.use('/social-media', social_media_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map