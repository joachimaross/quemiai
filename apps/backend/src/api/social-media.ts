import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../config';
import { tiktokService } from '../services/tiktok';
import { instagramService } from '../services/instagram';
import AppError from '../utils/AppError';
import { firebaseAuthMiddleware } from '../middleware/firebaseAuth';

/* eslint-disable @typescript-eslint/no-explicit-any */

const router: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Social Media
 *   description: Social media platform integrations (TikTok, Instagram)
 */

/**
 * @swagger
 * /connect/tiktok:
 *   post:
 *     summary: Connect a TikTok account
 *     tags: [Social Media]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *                 description: Authorization code from TikTok OAuth flow
 *     responses:
 *       200:
 *         description: TikTok account connected successfully
 *       400:
 *         description: Invalid request or authorization code
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/connect/tiktok',
  firebaseAuthMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { code } = req.body;
      const userId = (req as any).user?.uid;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      if (!code) {
        throw new AppError('Authorization code is required', 400);
      }

      // Exchange code for access token
      const tokenData = await tiktokService.getAccessToken(code);

      // Get user info from TikTok
      const userInfo = await tiktokService.getUserInfo(tokenData.access_token);

      // Calculate token expiry
      const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();

      // Store connection in database
      const usersCollection = db.collection('socialMediaConnections');

      // Check if connection already exists
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
        // Update existing connection
        const docId = existingConnection.docs[0].id;
        await usersCollection.doc(docId).update(connectionData);
      } else {
        // Create new connection
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
    } catch (error: any) {
      next(error);
    }
  },
);

/**
 * @swagger
 * /connect/instagram:
 *   post:
 *     summary: Connect an Instagram account
 *     tags: [Social Media]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *                 description: Authorization code from Instagram OAuth flow
 *     responses:
 *       200:
 *         description: Instagram account connected successfully
 *       400:
 *         description: Invalid request or authorization code
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/connect/instagram',
  firebaseAuthMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { code } = req.body;
      const userId = (req as any).user?.uid;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      if (!code) {
        throw new AppError('Authorization code is required', 400);
      }

      // Exchange code for short-lived token
      const shortTokenData = await instagramService.getShortLivedToken(code);

      // Exchange for long-lived token
      const longTokenData = await instagramService.getLongLivedToken(shortTokenData.access_token);

      // Get user profile info
      const userProfile = await instagramService.getUserProfile(
        longTokenData.access_token,
        shortTokenData.user_id.toString(),
      );

      // Calculate token expiry
      const expiresAt = new Date(Date.now() + longTokenData.expires_in * 1000).toISOString();

      // Store connection in database
      const usersCollection = db.collection('socialMediaConnections');

      // Check if connection already exists
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
        // Update existing connection
        const docId = existingConnection.docs[0].id;
        await usersCollection.doc(docId).update(connectionData);
      } else {
        // Create new connection
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
    } catch (error: any) {
      next(error);
    }
  },
);

/**
 * @swagger
 * /disconnect/tiktok:
 *   delete:
 *     summary: Disconnect a TikTok account
 *     tags: [Social Media]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: TikTok account disconnected successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: TikTok connection not found
 */
router.delete(
  '/disconnect/tiktok',
  firebaseAuthMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.uid;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const usersCollection = db.collection('socialMediaConnections');
      const connection = await usersCollection
        .where('userId', '==', userId)
        .where('platform', '==', 'tiktok')
        .get();

      if (connection.empty) {
        throw new AppError('TikTok connection not found', 404);
      }

      // Mark as inactive or delete
      await usersCollection.doc(connection.docs[0].id).update({
        isActive: false,
        updatedAt: new Date().toISOString(),
      });

      res.status(200).json({
        status: 'success',
        message: 'TikTok account disconnected successfully',
      });
    } catch (error: any) {
      next(error);
    }
  },
);

/**
 * @swagger
 * /disconnect/instagram:
 *   delete:
 *     summary: Disconnect an Instagram account
 *     tags: [Social Media]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Instagram account disconnected successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Instagram connection not found
 */
router.delete(
  '/disconnect/instagram',
  firebaseAuthMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.uid;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const usersCollection = db.collection('socialMediaConnections');
      const connection = await usersCollection
        .where('userId', '==', userId)
        .where('platform', '==', 'instagram')
        .get();

      if (connection.empty) {
        throw new AppError('Instagram connection not found', 404);
      }

      // Mark as inactive or delete
      await usersCollection.doc(connection.docs[0].id).update({
        isActive: false,
        updatedAt: new Date().toISOString(),
      });

      res.status(200).json({
        status: 'success',
        message: 'Instagram account disconnected successfully',
      });
    } catch (error: any) {
      next(error);
    }
  },
);

/**
 * @swagger
 * /user-data:
 *   get:
 *     summary: Fetch user data from connected social media platforms
 *     tags: [Social Media]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: platforms
 *         schema:
 *           type: string
 *         description: Comma-separated list of platforms (tiktok, instagram)
 *     responses:
 *       200:
 *         description: User data from connected platforms
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/user-data',
  firebaseAuthMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.uid;
      const platformsParam = req.query.platforms as string;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const platforms = platformsParam ? platformsParam.split(',') : ['tiktok', 'instagram'];

      const usersCollection = db.collection('socialMediaConnections');
      const connectionsSnapshot = await usersCollection
        .where('userId', '==', userId)
        .where('isActive', '==', true)
        .get();

      const results: any = {};

      for (const doc of connectionsSnapshot.docs) {
        const connection = doc.data();

        if (!platforms.includes(connection.platform)) {
          continue;
        }

        try {
          if (connection.platform === 'tiktok') {
            const userInfo = await tiktokService.getUserInfo(connection.accessToken);
            results.tiktok = {
              username: userInfo.display_name,
              followerCount: userInfo.follower_count,
              followingCount: userInfo.following_count,
              likesCount: userInfo.likes_count,
              videoCount: userInfo.video_count,
              avatarUrl: userInfo.avatar_url,
            };
          } else if (connection.platform === 'instagram') {
            const userProfile = await instagramService.getUserProfile(
              connection.accessToken,
              connection.platformUserId,
            );
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
        } catch (error: any) {
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
    } catch (error: any) {
      next(error);
    }
  },
);

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Fetch posts from connected social media platforms
 *     tags: [Social Media]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: platforms
 *         schema:
 *           type: string
 *         description: Comma-separated list of platforms (tiktok, instagram)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of posts to fetch per platform
 *     responses:
 *       200:
 *         description: Posts from connected platforms
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/posts',
  firebaseAuthMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.uid;
      const platformsParam = req.query.platforms as string;
      const limit = parseInt(req.query.limit as string) || 20;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const platforms = platformsParam ? platformsParam.split(',') : ['tiktok', 'instagram'];

      const usersCollection = db.collection('socialMediaConnections');
      const connectionsSnapshot = await usersCollection
        .where('userId', '==', userId)
        .where('isActive', '==', true)
        .get();

      const results: any = {};

      for (const doc of connectionsSnapshot.docs) {
        const connection = doc.data();

        if (!platforms.includes(connection.platform)) {
          continue;
        }

        try {
          if (connection.platform === 'tiktok') {
            const videos = await tiktokService.getUserVideos(
              connection.accessToken,
              undefined,
              limit,
            );
            results.tiktok = videos;
          } else if (connection.platform === 'instagram') {
            const media = await instagramService.getUserMedia(
              connection.accessToken,
              connection.platformUserId,
              limit,
            );
            results.instagram = media;
          }
        } catch (error: any) {
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
    } catch (error: any) {
      next(error);
    }
  },
);

/**
 * @swagger
 * /post:
 *   post:
 *     summary: Create a post on connected social media platforms
 *     tags: [Social Media]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - platforms
 *               - mediaUrl
 *             properties:
 *               platforms:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of platforms to post to (tiktok, instagram)
 *               mediaUrl:
 *                 type: string
 *                 description: URL of the media to post
 *               caption:
 *                 type: string
 *                 description: Caption/title for the post
 *               isVideo:
 *                 type: boolean
 *                 description: Whether the media is a video
 *     responses:
 *       200:
 *         description: Post created successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/post',
  firebaseAuthMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.uid;
      const { platforms, mediaUrl, caption, isVideo } = req.body;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
        throw new AppError('Platforms array is required', 400);
      }

      if (!mediaUrl) {
        throw new AppError('Media URL is required', 400);
      }

      const usersCollection = db.collection('socialMediaConnections');
      const connectionsSnapshot = await usersCollection
        .where('userId', '==', userId)
        .where('isActive', '==', true)
        .get();

      const results: any = {};

      for (const doc of connectionsSnapshot.docs) {
        const connection = doc.data();

        if (!platforms.includes(connection.platform)) {
          continue;
        }

        try {
          if (connection.platform === 'tiktok' && isVideo) {
            const result = await tiktokService.publishVideo(
              connection.accessToken,
              mediaUrl,
              caption || 'Posted from Quemiai',
            );
            results.tiktok = {
              success: true,
              data: result,
            };
          } else if (connection.platform === 'instagram') {
            const result = await instagramService.postContent(
              connection.accessToken,
              connection.platformUserId,
              mediaUrl,
              caption,
              isVideo,
            );
            results.instagram = {
              success: true,
              data: result,
            };
          }
        } catch (error: any) {
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
    } catch (error: any) {
      next(error);
    }
  },
);

/**
 * @swagger
 * /connections:
 *   get:
 *     summary: Get all connected social media accounts
 *     tags: [Social Media]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of connected social media accounts
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/connections',
  firebaseAuthMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.uid;

      if (!userId) {
        throw new AppError('User not authenticated', 401);
      }

      const usersCollection = db.collection('socialMediaConnections');
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
    } catch (error: any) {
      next(error);
    }
  },
);

export default router;
