import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../config';
import { validate, userValidationRules } from '../middleware/validation';
import AppError from '../utils/AppError';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management and profiles
 */

/**
 * @swagger
 * /users/{userId}:
 *   get:
 *     summary: Get user profile by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the user to retrieve
 *     responses:
 *       200:
 *         description: User profile data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 username:
 *                   type: string
 *                 email:
 *                   type: string
 *                 profilePicture:
 *                   type: string
 *                 bio:
 *                   type: string
 *                 location:
 *                   type: string
 *                 linkedSocialAccounts:
 *                   type: object
 *                 preferences:
 *                   type: object
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
// Get user profile
router.get('/:userId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doc = await db.collection('users').doc(req.params.userId).get();
    if (!doc.exists) {
      return next(new AppError('User not found', 404));
    }
    res.send({ id: doc.id, ...doc.data() });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /users/{userId}:
 *   put:
 *     summary: Update user profile by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the user to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               profilePicture:
 *                 type: string
 *               bio:
 *                 type: string
 *               location:
 *                 type: string
 *               linkedSocialAccounts:
 *                 type: object
 *               preferences:
 *                 type: object
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
// Update user profile
router.put('/:userId', validate(userValidationRules), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const { username, email, profilePicture, bannerPicture, bio, location, externalLinks, privacySettings, linkedSocialAccounts, preferences } = req.body;
    await db.collection('users').doc(userId).update({
      username,
      email,
      profilePicture,
      bannerPicture,
      bio,
      location,
      externalLinks,
      privacySettings,
      linkedSocialAccounts,
      preferences,
      updatedAt: new Date(),
    });
    res.send({ message: 'User profile updated successfully' });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /users/{userId}/follow:
 *   post:
 *     summary: Follow a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the user to follow
 *     responses:
 *       200:
 *         description: User followed successfully
 *       400:
 *         description: Cannot follow self or already following
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post('/:userId/follow', async (req: any, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params; // The user to follow
    const followerId = req.user.id; // Assuming req.user.id is set by an auth middleware

    if (userId === followerId) {
      return next(new AppError('Cannot follow yourself', 400));
    }

    const userToFollowRef = db.collection('users').doc(userId);
    const followerRef = db.collection('users').doc(followerId);

    const [userToFollowDoc, followerDoc] = await Promise.all([
      userToFollowRef.get(),
      followerRef.get(),
    ]);

    if (!userToFollowDoc.exists) {
      return next(new AppError('User to follow not found', 404));
    }
    if (!followerDoc.exists) {
      return next(new AppError('Follower user not found', 404));
    }

    // Check if already following
    const existingRelationship = await db.collection('relationships')
      .where('followerId', '==', followerId)
      .where('followingId', '==', userId)
      .limit(1)
      .get();

    if (!existingRelationship.empty) {
      return next(new AppError('Already following this user', 400));
    }

    // Create relationship
    await db.collection('relationships').add({
      followerId,
      followingId: userId,
      createdAt: new Date(),
    });

    // Update follower/following counts atomically
    await userToFollowRef.update({
      followersCount: (userToFollowDoc.data()?.followersCount || 0) + 1,
    });
    await followerRef.update({
      followingCount: (followerDoc.data()?.followingCount || 0) + 1,
    });

    res.status(200).send({ message: 'User followed successfully' });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /users/{userId}/unfollow:
 *   post:
 *     summary: Unfollow a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the user to unfollow
 *     responses:
 *       200:
 *         description: User unfollowed successfully
 *       400:
 *         description: Not following this user
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post('/:userId/unfollow', async (req: any, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params; // The user to unfollow
    const followerId = req.user.id; // Assuming req.user.id is set by an auth middleware

    const userToUnfollowRef = db.collection('users').doc(userId);
    const followerRef = db.collection('users').doc(followerId);

    const [userToUnfollowDoc, followerDoc] = await Promise.all([
      userToUnfollowRef.get(),
      followerRef.get(),
    ]);

    if (!userToUnfollowDoc.exists) {
      return next(new AppError('User to unfollow not found', 404));
    }
    if (!followerDoc.exists) {
      return next(new AppError('Follower user not found', 404));
    }

    // Find relationship
    const existingRelationship = await db.collection('relationships')
      .where('followerId', '==', followerId)
      .where('followingId', '==', userId)
      .limit(1)
      .get();

    if (existingRelationship.empty) {
      return next(new AppError('Not following this user', 400));
    }

    // Delete relationship
    await db.collection('relationships').doc(existingRelationship.docs[0].id).delete();

    // Update follower/following counts atomically
    await userToUnfollowRef.update({
      followersCount: Math.max(0, (userToUnfollowDoc.data()?.followersCount || 0) - 1),
    });
    await followerRef.update({
      followingCount: Math.max(0, (followerDoc.data()?.followingCount || 0) - 1),
    });

    res.status(200).send({ message: 'User unfollowed successfully' });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /users/{userId}/followers:
 *   get:
 *     summary: Get a user's followers
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the user to get followers for
 *     responses:
 *       200:
 *         description: List of followers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   username:
 *                     type: string
 *                   profilePicture:
 *                     type: string
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/:userId/followers', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;

    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return next(new AppError('User not found', 404));
    }

    const followersSnapshot = await db.collection('relationships')
      .where('followingId', '==', userId)
      .get();

    const followerIds = followersSnapshot.docs.map(doc => doc.data().followerId);

    if (followerIds.length === 0) {
      return res.status(200).send([]);
    }

    // Fetch follower details
    const followersPromises = followerIds.map(id => db.collection('users').doc(id).get());
    const followersDocs = await Promise.all(followersPromises);

    const followers = followersDocs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        username: data?.username,
        profilePicture: data?.profilePicture,
      };
    });

    res.status(200).send(followers);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /users/{userId}/following:
 *   get:
 *     summary: Get users a user is following
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the user to get following for
 *     responses:
 *       200:
 *         description: List of users being followed
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   username:
 *                     type: string
 *                   profilePicture:
 *                     type: string
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/:userId/following', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;

    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return next(new AppError('User not found', 404));
    }

    const followingSnapshot = await db.collection('relationships')
      .where('followerId', '==', userId)
      .get();

    const followingIds = followingSnapshot.docs.map(doc => doc.data().followingId);

    if (followingIds.length === 0) {
      return res.status(200).send([]);
    }

    // Fetch following details
    const followingPromises = followingIds.map(id => db.collection('users').doc(id).get());
    const followingDocs = await Promise.all(followingPromises);

    const following = followingDocs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        username: data?.username,
        profilePicture: data?.profilePicture,
      };
    });

    res.status(200).send(following);
  } catch (error) {
    next(error);
  }
});


/**
 * @swagger
 * /users/{userId}/settings:
 *   get:
 *     summary: Get user personalization settings by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the user to retrieve settings for
 *     responses:
 *       200:
 *         description: User settings data
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
// Get user personalization settings
router.get('/:userId/settings', async (req, res, next) => {
  try {
    const doc = await db.collection('users').doc(req.params.userId).get();
    if (!doc.exists) {
      return next(new AppError('User not found', 404));
    }
    const settings = {
      dashboardLayout: doc.data()?.dashboardLayout || {},
      customTabs: doc.data()?.customTabs || [],
      themeSettings: doc.data()?.themeSettings || {},
    };
    res.send(settings);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /users/{userId}/settings:
 *   put:
 *     summary: Update user personalization settings by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the user to update settings for
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dashboardLayout:
 *                 type: object
 *               customTabs:
 *                 type: array
 *                 items:
 *                   type: object
 *               themeSettings:
 *                 type: object
 *     responses:
 *       200:
 *         description: User settings updated successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
// Update user personalization settings
router.put('/:userId/settings', async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { dashboardLayout, customTabs, themeSettings } = req.body;
    await db.collection('users').doc(userId).update({
      dashboardLayout,
      customTabs,
      themeSettings,
      updatedAt: new Date(),
    });
    res.send({ message: 'User settings updated successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
