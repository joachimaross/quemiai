"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const config_1 = require("../config");
const tiktok_1 = require("../services/tiktok");
const instagram_1 = require("../services/instagram");
const AppError_1 = __importDefault(require("../utils/AppError"));
const firebaseAuth_1 = require("../middleware/firebaseAuth");
const router = (0, express_1.Router)();
router.post('/connect/tiktok', firebaseAuth_1.firebaseAuthMiddleware, async (req, res, next) => {
    try {
        const { code } = req.body;
        const userId = req.user?.uid;
        if (!userId) {
            throw new AppError_1.default('User not authenticated', 401);
        }
        if (!code) {
            throw new AppError_1.default('Authorization code is required', 400);
        }
        const tokenData = await tiktok_1.tiktokService.getAccessToken(code);
        const userInfo = await tiktok_1.tiktokService.getUserInfo(tokenData.access_token);
        const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();
        const usersCollection = config_1.db.collection('socialMediaConnections');
        const existingConnection = await usersCollection
            .where('userId', '==', userId)
            .where('platform', '==', 'tiktok')
            .get();
        const connectionData = {
            userId,
            platform: 'tiktok',
            platformUserId: userInfo.open_id,
            platformUsername: userInfo.display_name,
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            tokenExpiresAt: expiresAt,
            isActive: true,
            metadata: JSON.stringify({
                followerCount: userInfo.follower_count,
                followingCount: userInfo.following_count,
                likesCount: userInfo.likes_count,
                videoCount: userInfo.video_count,
                avatarUrl: userInfo.avatar_url,
            }),
            updatedAt: new Date().toISOString(),
        };
        if (!existingConnection.empty) {
            const docId = existingConnection.docs[0].id;
            await usersCollection.doc(docId).update(connectionData);
        }
        else {
            await usersCollection.add({
                ...connectionData,
                createdAt: new Date().toISOString(),
            });
        }
        res.status(200).json({
            status: 'success',
            message: 'TikTok account connected successfully',
            data: {
                platform: 'tiktok',
                username: userInfo.display_name,
                followerCount: userInfo.follower_count,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
router.post('/connect/instagram', firebaseAuth_1.firebaseAuthMiddleware, async (req, res, next) => {
    try {
        const { code } = req.body;
        const userId = req.user?.uid;
        if (!userId) {
            throw new AppError_1.default('User not authenticated', 401);
        }
        if (!code) {
            throw new AppError_1.default('Authorization code is required', 400);
        }
        const shortTokenData = await instagram_1.instagramService.getShortLivedToken(code);
        const longTokenData = await instagram_1.instagramService.getLongLivedToken(shortTokenData.access_token);
        const userProfile = await instagram_1.instagramService.getUserProfile(longTokenData.access_token, shortTokenData.user_id.toString());
        const expiresAt = new Date(Date.now() + longTokenData.expires_in * 1000).toISOString();
        const usersCollection = config_1.db.collection('socialMediaConnections');
        const existingConnection = await usersCollection
            .where('userId', '==', userId)
            .where('platform', '==', 'instagram')
            .get();
        const connectionData = {
            userId,
            platform: 'instagram',
            platformUserId: userProfile.id,
            platformUsername: userProfile.username,
            accessToken: longTokenData.access_token,
            refreshToken: null,
            tokenExpiresAt: expiresAt,
            isActive: true,
            metadata: JSON.stringify({
                accountType: userProfile.account_type,
                mediaCount: userProfile.media_count,
                followersCount: userProfile.followers_count,
                followsCount: userProfile.follows_count,
                name: userProfile.name,
                biography: userProfile.biography,
                website: userProfile.website,
                profilePictureUrl: userProfile.profile_picture_url,
            }),
            updatedAt: new Date().toISOString(),
        };
        if (!existingConnection.empty) {
            const docId = existingConnection.docs[0].id;
            await usersCollection.doc(docId).update(connectionData);
        }
        else {
            await usersCollection.add({
                ...connectionData,
                createdAt: new Date().toISOString(),
            });
        }
        res.status(200).json({
            status: 'success',
            message: 'Instagram account connected successfully',
            data: {
                platform: 'instagram',
                username: userProfile.username,
                followersCount: userProfile.followers_count,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
router.delete('/disconnect/tiktok', firebaseAuth_1.firebaseAuthMiddleware, async (req, res, next) => {
    try {
        const userId = req.user?.uid;
        if (!userId) {
            throw new AppError_1.default('User not authenticated', 401);
        }
        const usersCollection = config_1.db.collection('socialMediaConnections');
        const connection = await usersCollection
            .where('userId', '==', userId)
            .where('platform', '==', 'tiktok')
            .get();
        if (connection.empty) {
            throw new AppError_1.default('TikTok connection not found', 404);
        }
        await usersCollection.doc(connection.docs[0].id).update({
            isActive: false,
            updatedAt: new Date().toISOString(),
        });
        res.status(200).json({
            status: 'success',
            message: 'TikTok account disconnected successfully',
        });
    }
    catch (error) {
        next(error);
    }
});
router.delete('/disconnect/instagram', firebaseAuth_1.firebaseAuthMiddleware, async (req, res, next) => {
    try {
        const userId = req.user?.uid;
        if (!userId) {
            throw new AppError_1.default('User not authenticated', 401);
        }
        const usersCollection = config_1.db.collection('socialMediaConnections');
        const connection = await usersCollection
            .where('userId', '==', userId)
            .where('platform', '==', 'instagram')
            .get();
        if (connection.empty) {
            throw new AppError_1.default('Instagram connection not found', 404);
        }
        await usersCollection.doc(connection.docs[0].id).update({
            isActive: false,
            updatedAt: new Date().toISOString(),
        });
        res.status(200).json({
            status: 'success',
            message: 'Instagram account disconnected successfully',
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/user-data', firebaseAuth_1.firebaseAuthMiddleware, async (req, res, next) => {
    try {
        const userId = req.user?.uid;
        const platformsParam = req.query.platforms;
        if (!userId) {
            throw new AppError_1.default('User not authenticated', 401);
        }
        const platforms = platformsParam ? platformsParam.split(',') : ['tiktok', 'instagram'];
        const usersCollection = config_1.db.collection('socialMediaConnections');
        const connectionsSnapshot = await usersCollection
            .where('userId', '==', userId)
            .where('isActive', '==', true)
            .get();
        const results = {};
        for (const doc of connectionsSnapshot.docs) {
            const connection = doc.data();
            if (!platforms.includes(connection.platform)) {
                continue;
            }
            try {
                if (connection.platform === 'tiktok') {
                    const userInfo = await tiktok_1.tiktokService.getUserInfo(connection.accessToken);
                    results.tiktok = {
                        username: userInfo.display_name,
                        followerCount: userInfo.follower_count,
                        followingCount: userInfo.following_count,
                        likesCount: userInfo.likes_count,
                        videoCount: userInfo.video_count,
                        avatarUrl: userInfo.avatar_url,
                    };
                }
                else if (connection.platform === 'instagram') {
                    const userProfile = await instagram_1.instagramService.getUserProfile(connection.accessToken, connection.platformUserId);
                    results.instagram = {
                        username: userProfile.username,
                        followersCount: userProfile.followers_count,
                        followsCount: userProfile.follows_count,
                        mediaCount: userProfile.media_count,
                        accountType: userProfile.account_type,
                        name: userProfile.name,
                        biography: userProfile.biography,
                        website: userProfile.website,
                        profilePictureUrl: userProfile.profile_picture_url,
                    };
                }
            }
            catch (error) {
                results[connection.platform] = {
                    error: 'Failed to fetch data',
                    message: error.message,
                };
            }
        }
        res.status(200).json({
            status: 'success',
            data: results,
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/posts', firebaseAuth_1.firebaseAuthMiddleware, async (req, res, next) => {
    try {
        const userId = req.user?.uid;
        const platformsParam = req.query.platforms;
        const limit = parseInt(req.query.limit) || 20;
        if (!userId) {
            throw new AppError_1.default('User not authenticated', 401);
        }
        const platforms = platformsParam ? platformsParam.split(',') : ['tiktok', 'instagram'];
        const usersCollection = config_1.db.collection('socialMediaConnections');
        const connectionsSnapshot = await usersCollection
            .where('userId', '==', userId)
            .where('isActive', '==', true)
            .get();
        const results = {};
        for (const doc of connectionsSnapshot.docs) {
            const connection = doc.data();
            if (!platforms.includes(connection.platform)) {
                continue;
            }
            try {
                if (connection.platform === 'tiktok') {
                    const videos = await tiktok_1.tiktokService.getUserVideos(connection.accessToken, undefined, limit);
                    results.tiktok = videos;
                }
                else if (connection.platform === 'instagram') {
                    const media = await instagram_1.instagramService.getUserMedia(connection.accessToken, connection.platformUserId, limit);
                    results.instagram = media;
                }
            }
            catch (error) {
                results[connection.platform] = {
                    error: 'Failed to fetch posts',
                    message: error.message,
                };
            }
        }
        res.status(200).json({
            status: 'success',
            data: results,
        });
    }
    catch (error) {
        next(error);
    }
});
router.post('/post', firebaseAuth_1.firebaseAuthMiddleware, async (req, res, next) => {
    try {
        const userId = req.user?.uid;
        const { platforms, mediaUrl, caption, isVideo } = req.body;
        if (!userId) {
            throw new AppError_1.default('User not authenticated', 401);
        }
        if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
            throw new AppError_1.default('Platforms array is required', 400);
        }
        if (!mediaUrl) {
            throw new AppError_1.default('Media URL is required', 400);
        }
        const usersCollection = config_1.db.collection('socialMediaConnections');
        const connectionsSnapshot = await usersCollection
            .where('userId', '==', userId)
            .where('isActive', '==', true)
            .get();
        const results = {};
        for (const doc of connectionsSnapshot.docs) {
            const connection = doc.data();
            if (!platforms.includes(connection.platform)) {
                continue;
            }
            try {
                if (connection.platform === 'tiktok' && isVideo) {
                    const result = await tiktok_1.tiktokService.publishVideo(connection.accessToken, mediaUrl, caption || 'Posted from Quemiai');
                    results.tiktok = {
                        success: true,
                        data: result,
                    };
                }
                else if (connection.platform === 'instagram') {
                    const result = await instagram_1.instagramService.postContent(connection.accessToken, connection.platformUserId, mediaUrl, caption, isVideo);
                    results.instagram = {
                        success: true,
                        data: result,
                    };
                }
            }
            catch (error) {
                results[connection.platform] = {
                    success: false,
                    error: error.message,
                };
            }
        }
        res.status(200).json({
            status: 'success',
            message: 'Post creation completed',
            data: results,
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/connections', firebaseAuth_1.firebaseAuthMiddleware, async (req, res, next) => {
    try {
        const userId = req.user?.uid;
        if (!userId) {
            throw new AppError_1.default('User not authenticated', 401);
        }
        const usersCollection = config_1.db.collection('socialMediaConnections');
        const connectionsSnapshot = await usersCollection.where('userId', '==', userId).get();
        const connections = connectionsSnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                platform: data.platform,
                platformUsername: data.platformUsername,
                isActive: data.isActive,
                tokenExpiresAt: data.tokenExpiresAt,
                metadata: data.metadata ? JSON.parse(data.metadata) : null,
                createdAt: data.createdAt,
                updatedAt: data.updatedAt,
            };
        });
        res.status(200).json({
            status: 'success',
            data: connections,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=social-media.js.map