import { Router } from 'express';
import { db } from '../config';
import { validate, userValidationRules } from '../middleware/validation';

const router = Router();

// Get user profile
router.get('/:userId', async (req, res, next) => {
  try {
    const doc = await db.collection('users').doc(req.params.userId).get();
    if (!doc.exists) {
      return res.status(404).send({ error: 'User not found' });
    }
    res.send({ id: doc.id, ...doc.data() });
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.put('/:userId', validate(userValidationRules), async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { username, email, profilePicture, bio, linkedSocialAccounts, preferences } = req.body;
    await db.collection('users').doc(userId).update({
      username,
      email,
      profilePicture,
      bio,
      linkedSocialAccounts,
      preferences,
      updatedAt: new Date(),
    });
    res.send({ message: 'User profile updated successfully' });
  } catch (error) {
    next(error);
  }
});

// Get user personalization settings
router.get('/:userId/settings', async (req, res, next) => {
  try {
    const doc = await db.collection('users').doc(req.params.userId).get();
    if (!doc.exists) {
      return res.status(404).send({ error: 'User not found' });
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
