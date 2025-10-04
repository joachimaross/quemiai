"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.instagramService = exports.InstagramService = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../config");
class InstagramService {
    constructor() {
        this.baseUrl = 'https://graph.facebook.com/v18.0';
        this.client = axios_1.default.create({
            baseURL: this.baseUrl,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
    getAuthorizationUrl(state) {
        const params = new URLSearchParams({
            client_id: config_1.config.instagram.clientId,
            redirect_uri: config_1.config.instagram.redirectUri,
            scope: 'instagram_basic,instagram_content_publish,pages_show_list',
            response_type: 'code',
            state,
        });
        return `https://api.instagram.com/oauth/authorize?${params.toString()}`;
    }
    async getShortLivedToken(code) {
        const response = await axios_1.default.post('https://api.instagram.com/oauth/access_token', {
            client_id: config_1.config.instagram.clientId,
            client_secret: config_1.config.instagram.clientSecret,
            grant_type: 'authorization_code',
            redirect_uri: config_1.config.instagram.redirectUri,
            code,
        }, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        return response.data;
    }
    async getLongLivedToken(shortLivedToken) {
        const response = await this.client.get('/access_token', {
            params: {
                grant_type: 'ig_exchange_token',
                client_secret: config_1.config.instagram.clientSecret,
                access_token: shortLivedToken,
            },
        });
        return response.data;
    }
    async refreshLongLivedToken(accessToken) {
        const response = await this.client.get('/refresh_access_token', {
            params: {
                grant_type: 'ig_refresh_token',
                access_token: accessToken,
            },
        });
        return response.data;
    }
    async getUserProfile(accessToken, userId) {
        const response = await this.client.get(`/${userId}`, {
            params: {
                fields: 'id,username,account_type,media_count,followers_count,follows_count,name,profile_picture_url,biography,website',
                access_token: accessToken,
            },
        });
        return response.data;
    }
    async getUserMedia(accessToken, userId, limit = 25, after) {
        const params = {
            fields: 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,username,like_count,comments_count',
            access_token: accessToken,
            limit,
        };
        if (after) {
            params.after = after;
        }
        const response = await this.client.get(`/${userId}/media`, {
            params,
        });
        return response.data;
    }
    async getMediaInsights(accessToken, mediaId) {
        const response = await this.client.get(`/${mediaId}/insights`, {
            params: {
                metric: 'engagement,impressions,reach,saved',
                access_token: accessToken,
            },
        });
        return response.data;
    }
    async getUserInsights(accessToken, userId, metric = 'follower_count,profile_views', period = 'day') {
        const response = await this.client.get(`/${userId}/insights`, {
            params: {
                metric,
                period,
                access_token: accessToken,
            },
        });
        return response.data;
    }
    async createMediaContainer(accessToken, userId, imageUrl, caption) {
        const response = await this.client.post(`/${userId}/media`, null, {
            params: {
                image_url: imageUrl,
                caption,
                access_token: accessToken,
            },
        });
        return response.data;
    }
    async createVideoContainer(accessToken, userId, videoUrl, caption, coverUrl) {
        const params = {
            media_type: 'VIDEO',
            video_url: videoUrl,
            caption,
            access_token: accessToken,
        };
        if (coverUrl) {
            params.thumb_offset = 0;
        }
        const response = await this.client.post(`/${userId}/media`, null, {
            params,
        });
        return response.data;
    }
    async publishMedia(accessToken, userId, creationId) {
        const response = await this.client.post(`/${userId}/media_publish`, null, {
            params: {
                creation_id: creationId,
                access_token: accessToken,
            },
        });
        return response.data;
    }
    async getMedia(accessToken, mediaId) {
        const response = await this.client.get(`/${mediaId}`, {
            params: {
                fields: 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count',
                access_token: accessToken,
            },
        });
        return response.data;
    }
    async getMediaComments(accessToken, mediaId) {
        const response = await this.client.get(`/${mediaId}/comments`, {
            params: {
                fields: 'id,text,username,timestamp',
                access_token: accessToken,
            },
        });
        return response.data;
    }
    async postContent(accessToken, userId, mediaUrl, caption, isVideo = false) {
        let containerResponse;
        if (isVideo) {
            containerResponse = await this.createVideoContainer(accessToken, userId, mediaUrl, caption);
        }
        else {
            containerResponse = await this.createMediaContainer(accessToken, userId, mediaUrl, caption);
        }
        const publishResponse = await this.publishMedia(accessToken, userId, containerResponse.id);
        const mediaDetails = (await this.getMedia(accessToken, publishResponse.id));
        return {
            id: publishResponse.id,
            permalink: mediaDetails.permalink,
        };
    }
}
exports.InstagramService = InstagramService;
exports.instagramService = new InstagramService();
//# sourceMappingURL=instagram.js.map