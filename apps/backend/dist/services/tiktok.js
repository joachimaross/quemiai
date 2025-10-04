"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tiktokService = exports.TikTokService = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../config");
class TikTokService {
    constructor() {
        this.baseUrl = 'https://open.tiktokapis.com/v2';
        this.client = axios_1.default.create({
            baseURL: this.baseUrl,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
    getAuthorizationUrl(state) {
        const params = new URLSearchParams({
            client_key: config_1.config.tiktok.clientKey,
            response_type: 'code',
            scope: 'user.info.basic,video.list,video.upload',
            redirect_uri: config_1.config.tiktok.redirectUri,
            state,
        });
        return `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`;
    }
    async getAccessToken(code) {
        const response = await axios_1.default.post('https://open.tiktokapis.com/v2/oauth/token/', {
            client_key: config_1.config.tiktok.clientKey,
            client_secret: config_1.config.tiktok.clientSecret,
            code,
            grant_type: 'authorization_code',
            redirect_uri: config_1.config.tiktok.redirectUri,
        }, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        return response.data;
    }
    async getUserInfo(accessToken) {
        const response = await this.client.get('/user/info/', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            params: {
                fields: 'open_id,union_id,avatar_url,display_name,follower_count,following_count,likes_count,video_count',
            },
        });
        return response.data.data.user;
    }
    async getUserVideos(accessToken, cursor, maxCount = 20) {
        const params = {
            max_count: maxCount,
        };
        if (cursor) {
            params.cursor = cursor;
        }
        const response = await this.client.get('/video/list/', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            params,
        });
        return response.data.data;
    }
    async getVideoInsights(accessToken, videoIds) {
        const response = await this.client.post('/video/query/', {
            filters: {
                video_ids: videoIds,
            },
            fields: 'id,create_time,cover_image_url,share_url,video_description,duration,height,width,title,embed_html,embed_link,like_count,comment_count,share_count,view_count',
        }, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        return response.data.data;
    }
    async initializeVideoUpload(accessToken) {
        const response = await this.client.post('/post/publish/video/init/', {
            post_info: {
                title: 'Video from Quemiai',
                privacy_level: 'PUBLIC_TO_EVERYONE',
                disable_duet: false,
                disable_comment: false,
                disable_stitch: false,
                video_cover_timestamp_ms: 1000,
            },
            source_info: {
                source: 'PULL_FROM_URL',
                video_url: '',
            },
        }, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data.data;
    }
    async publishVideo(accessToken, videoUrl, title, description) {
        const response = await this.client.post('/post/publish/video/init/', {
            post_info: {
                title,
                description,
                privacy_level: 'PUBLIC_TO_EVERYONE',
                disable_duet: false,
                disable_comment: false,
                disable_stitch: false,
                video_cover_timestamp_ms: 1000,
            },
            source_info: {
                source: 'PULL_FROM_URL',
                video_url: videoUrl,
            },
        }, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    }
    async refreshAccessToken(refreshToken) {
        const response = await axios_1.default.post('https://open.tiktokapis.com/v2/oauth/token/', {
            client_key: config_1.config.tiktok.clientKey,
            client_secret: config_1.config.tiktok.clientSecret,
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
        }, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        return response.data;
    }
}
exports.TikTokService = TikTokService;
exports.tiktokService = new TikTokService();
//# sourceMappingURL=tiktok.js.map