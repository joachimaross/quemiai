import { Router } from 'express';
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
router.get('/:userId', async (req, res, next) => {
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
router.put('/:userId', validate(userValidationRules), async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { username, email, profilePicture, bio, location, linkedSocialAccounts, preferences } = req.body;
    await db.collection('users').doc(userId).update({
      username,
      email,
      profilePicture,
      bio,
      location,
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
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
// Placeholder for Follow User
router.post('/:userId/follow', (req, res) => {
  res.status(200).send({ message: 'Follow user functionality (placeholder)' });
});

/**
 * @swagger
 * /users/{userId}/unfollow:
 *   post:
 *     summary: Unfollow a user
 *     tags: [Users]
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
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
// Placeholder for Unfollow User
router.post('/:userId/unfollow', (req, res) => {
  res.status(200).send({ message: 'Unfollow user functionality (placeholder)' });
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
