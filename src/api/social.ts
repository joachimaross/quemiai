import { Router, Request, Response, NextFunction } from 'express';
import { tiktokService } from '../services/tiktok';
import { instagramService } from '../services/instagram';
import { db } from '../config';
import AppError from '../utils/AppError';

const router = Router();

/**
 * Connect TikTok account
 * POST /api/v1/connect/tiktok
 */
router.post(
  '/connect/tiktok',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { code, userId } = req.body;

      if (!code || !userId) {
        return next(new AppError('Authorization code and userId are required', 400));
      }

      // Exchange code for access token
      const authResult = await tiktokService.authenticate(code);

      // Fetch user data from TikTok
      const userData = await tiktokService.getUserData(authResult.accessToken);

      // Store the connection in the database
      await db.collection('socialConnections').add({
        userId,
        platform: 'tiktok',
        accessToken: authResult.accessToken,
        refreshToken: authResult.refreshToken,
        expiresIn: authResult.expiresIn,
        platformUserId: userData.openId,
        platformUsername: userData.displayName,
        connectedAt: new Date(),
      });

      res.status(200).json({
        status: 'success',
        message: 'TikTok account connected successfully.',
        data: {
          username: userData.displayName,
          followerCount: userData.followerCount,
        },
      });
    } catch (error) {
      console.error('Error connecting TikTok account:', error);
      return next(new AppError('Failed to connect TikTok account', 500));
    }
  }
);

/**
 * Disconnect TikTok account
 * DELETE /api/v1/disconnect/tiktok
 */
router.delete(
  '/disconnect/tiktok',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.body;

      if (!userId) {
        return next(new AppError('userId is required', 400));
      }

      // Find and delete the connection
      const connectionsRef = db.collection('socialConnections');
      const snapshot = await connectionsRef
        .where('userId', '==', userId)
        .where('platform', '==', 'tiktok')
        .get();

      if (snapshot.empty) {
        return next(new AppError('TikTok account not connected', 404));
      }

      const batch = db.batch();
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      res.status(200).json({
        status: 'success',
        message: 'TikTok account disconnected successfully.',
      });
    } catch (error) {
      console.error('Error disconnecting TikTok account:', error);
      return next(new AppError('Failed to disconnect TikTok account', 500));
    }
  }
);

/**
 * Connect Instagram account
 * POST /api/v1/connect/instagram
 */
router.post(
  '/connect/instagram',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { code, userId, redirectUri } = req.body;

      if (!code || !userId || !redirectUri) {
        return next(new AppError('Authorization code, userId, and redirectUri are required', 400));
      }

      // Exchange code for access token
      const authResult = await instagramService.authenticate(code, redirectUri);

      // Get long-lived token
      const longLivedToken = await instagramService.getLongLivedToken(authResult.accessToken);

      // Fetch user data from Instagram
      const userData = await instagramService.getUserData(longLivedToken.accessToken);

      // Try to get business account data (if available)
      const businessData = await instagramService.getBusinessAccountData(
        userData.id,
        longLivedToken.accessToken
      );

      // Store the connection in the database
      await db.collection('socialConnections').add({
        userId,
        platform: 'instagram',
        accessToken: longLivedToken.accessToken,
        expiresIn: longLivedToken.expiresIn,
        platformUserId: userData.id,
        platformUsername: userData.username,
        connectedAt: new Date(),
      });

      res.status(200).json({
        status: 'success',
        message: 'Instagram account connected successfully.',
        data: {
          username: userData.username,
          followersCount: businessData.followersCount,
          mediaCount: userData.mediaCount,
        },
      });
    } catch (error) {
      console.error('Error connecting Instagram account:', error);
      return next(new AppError('Failed to connect Instagram account', 500));
    }
  }
);

/**
 * Disconnect Instagram account
 * DELETE /api/v1/disconnect/instagram
 */
router.delete(
  '/disconnect/instagram',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.body;

      if (!userId) {
        return next(new AppError('userId is required', 400));
      }

      // Find and delete the connection
      const connectionsRef = db.collection('socialConnections');
      const snapshot = await connectionsRef
        .where('userId', '==', userId)
        .where('platform', '==', 'instagram')
        .get();

      if (snapshot.empty) {
        return next(new AppError('Instagram account not connected', 404));
      }

      const batch = db.batch();
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      res.status(200).json({
        status: 'success',
        message: 'Instagram account disconnected successfully.',
      });
    } catch (error) {
      console.error('Error disconnecting Instagram account:', error);
      return next(new AppError('Failed to disconnect Instagram account', 500));
    }
  }
);

/**
 * Get TikTok user data
 * GET /api/v1/tiktok/user
 */
router.get(
  '/tiktok/user',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.query;

      if (!userId) {
        return next(new AppError('userId is required', 400));
      }

      // Fetch connection from database
      const connectionsRef = db.collection('socialConnections');
      const snapshot = await connectionsRef
        .where('userId', '==', userId)
        .where('platform', '==', 'tiktok')
        .get();

      if (snapshot.empty) {
        return next(new AppError('TikTok account not connected', 404));
      }

      const connection = snapshot.docs[0].data();
      const userData = await tiktokService.getUserData(connection.accessToken);

      res.status(200).json({
        status: 'success',
        data: userData,
      });
    } catch (error) {
      console.error('Error fetching TikTok user data:', error);
      return next(new AppError('Failed to fetch TikTok user data', 500));
    }
  }
);

/**
 * Get TikTok posts
 * GET /api/v1/tiktok/posts
 */
router.get(
  '/tiktok/posts',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, limit } = req.query;

      if (!userId) {
        return next(new AppError('userId is required', 400));
      }

      // Fetch connection from database
      const connectionsRef = db.collection('socialConnections');
      const snapshot = await connectionsRef
        .where('userId', '==', userId)
        .where('platform', '==', 'tiktok')
        .get();

      if (snapshot.empty) {
        return next(new AppError('TikTok account not connected', 404));
      }

      const connection = snapshot.docs[0].data();
      const maxCount = limit ? parseInt(limit as string, 10) : 10;
      const posts = await tiktokService.getUserPosts(connection.accessToken, maxCount);

      res.status(200).json({
        status: 'success',
        data: posts,
      });
    } catch (error) {
      console.error('Error fetching TikTok posts:', error);
      return next(new AppError('Failed to fetch TikTok posts', 500));
    }
  }
);

/**
 * Post to TikTok
 * POST /api/v1/tiktok/post
 */
router.post(
  '/tiktok/post',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, videoUrl, description, privacyLevel } = req.body;

      if (!userId || !videoUrl) {
        return next(new AppError('userId and videoUrl are required', 400));
      }

      // Fetch connection from database
      const connectionsRef = db.collection('socialConnections');
      const snapshot = await connectionsRef
        .where('userId', '==', userId)
        .where('platform', '==', 'tiktok')
        .get();

      if (snapshot.empty) {
        return next(new AppError('TikTok account not connected', 404));
      }

      const connection = snapshot.docs[0].data();
      const result = await tiktokService.postContent(connection.accessToken, {
        videoUrl,
        description,
        privacyLevel,
      });

      res.status(200).json({
        status: 'success',
        message: 'Content posted to TikTok successfully.',
        data: result,
      });
    } catch (error) {
      console.error('Error posting to TikTok:', error);
      return next(new AppError('Failed to post to TikTok', 500));
    }
  }
);

/**
 * Get Instagram user data
 * GET /api/v1/instagram/user
 */
router.get(
  '/instagram/user',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.query;

      if (!userId) {
        return next(new AppError('userId is required', 400));
      }

      // Fetch connection from database
      const connectionsRef = db.collection('socialConnections');
      const snapshot = await connectionsRef
        .where('userId', '==', userId)
        .where('platform', '==', 'instagram')
        .get();

      if (snapshot.empty) {
        return next(new AppError('Instagram account not connected', 404));
      }

      const connection = snapshot.docs[0].data();
      const userData = await instagramService.getUserData(connection.accessToken);
      const businessData = await instagramService.getBusinessAccountData(
        connection.platformUserId,
        connection.accessToken
      );

      res.status(200).json({
        status: 'success',
        data: { ...userData, ...businessData },
      });
    } catch (error) {
      console.error('Error fetching Instagram user data:', error);
      return next(new AppError('Failed to fetch Instagram user data', 500));
    }
  }
);

/**
 * Get Instagram posts
 * GET /api/v1/instagram/posts
 */
router.get(
  '/instagram/posts',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, limit } = req.query;

      if (!userId) {
        return next(new AppError('userId is required', 400));
      }

      // Fetch connection from database
      const connectionsRef = db.collection('socialConnections');
      const snapshot = await connectionsRef
        .where('userId', '==', userId)
        .where('platform', '==', 'instagram')
        .get();

      if (snapshot.empty) {
        return next(new AppError('Instagram account not connected', 404));
      }

      const connection = snapshot.docs[0].data();
      const maxCount = limit ? parseInt(limit as string, 10) : 10;
      const posts = await instagramService.getUserPosts(connection.accessToken, maxCount);

      res.status(200).json({
        status: 'success',
        data: posts,
      });
    } catch (error) {
      console.error('Error fetching Instagram posts:', error);
      return next(new AppError('Failed to fetch Instagram posts', 500));
    }
  }
);

/**
 * Post to Instagram
 * POST /api/v1/instagram/post
 */
router.post(
  '/instagram/post',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, imageUrl, videoUrl, caption, mediaType } = req.body;

      if (!userId || (!imageUrl && !videoUrl)) {
        return next(new AppError('userId and either imageUrl or videoUrl are required', 400));
      }

      // Fetch connection from database
      const connectionsRef = db.collection('socialConnections');
      const snapshot = await connectionsRef
        .where('userId', '==', userId)
        .where('platform', '==', 'instagram')
        .get();

      if (snapshot.empty) {
        return next(new AppError('Instagram account not connected', 404));
      }

      const connection = snapshot.docs[0].data();
      const result = await instagramService.postContent(
        connection.platformUserId,
        connection.accessToken,
        {
          imageUrl,
          videoUrl,
          caption,
          mediaType: mediaType || (videoUrl ? 'VIDEO' : 'IMAGE'),
        }
      );

      res.status(200).json({
        status: 'success',
        message: 'Content posted to Instagram successfully.',
        data: result,
      });
    } catch (error) {
      console.error('Error posting to Instagram:', error);
      return next(new AppError('Failed to post to Instagram', 500));
    }
  }
);

/**
 * Get engagement metrics for TikTok posts
 * GET /api/v1/tiktok/engagement
 */
router.get(
  '/tiktok/engagement',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, videoIds } = req.query;

      if (!userId || !videoIds) {
        return next(new AppError('userId and videoIds are required', 400));
      }

      // Fetch connection from database
      const connectionsRef = db.collection('socialConnections');
      const snapshot = await connectionsRef
        .where('userId', '==', userId)
        .where('platform', '==', 'tiktok')
        .get();

      if (snapshot.empty) {
        return next(new AppError('TikTok account not connected', 404));
      }

      const connection = snapshot.docs[0].data();
      const videoIdArray = Array.isArray(videoIds) ? videoIds : [videoIds];
      const metrics = await tiktokService.getEngagementMetrics(
        connection.accessToken,
        videoIdArray as string[]
      );

      res.status(200).json({
        status: 'success',
        data: metrics,
      });
    } catch (error) {
      console.error('Error fetching TikTok engagement metrics:', error);
      return next(new AppError('Failed to fetch engagement metrics', 500));
    }
  }
);

/**
 * Get engagement metrics for Instagram posts
 * GET /api/v1/instagram/engagement
 */
router.get(
  '/instagram/engagement',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, postIds } = req.query;

      if (!userId || !postIds) {
        return next(new AppError('userId and postIds are required', 400));
      }

      // Fetch connection from database
      const connectionsRef = db.collection('socialConnections');
      const snapshot = await connectionsRef
        .where('userId', '==', userId)
        .where('platform', '==', 'instagram')
        .get();

      if (snapshot.empty) {
        return next(new AppError('Instagram account not connected', 404));
      }

      const connection = snapshot.docs[0].data();
      const postIdArray = Array.isArray(postIds) ? postIds : [postIds];
      const metrics = await instagramService.getEngagementMetrics(
        connection.accessToken,
        postIdArray as string[]
      );

      res.status(200).json({
        status: 'success',
        data: metrics,
      });
    } catch (error) {
      console.error('Error fetching Instagram engagement metrics:', error);
      return next(new AppError('Failed to fetch engagement metrics', 500));
    }
  }
);

export default router;
