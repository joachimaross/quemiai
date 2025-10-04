"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const config_1 = require("../config");
const validation_1 = require("../middleware/validation");
const AppError_1 = __importDefault(require("../utils/AppError"));
const router = (0, express_1.Router)();
router.get('/:userId', async (req, res, next) => {
    try {
        const doc = await config_1.db.collection('users').doc(req.params.userId).get();
        if (!doc.exists) {
            return next(new AppError_1.default('User not found', 404));
        }
        return res.send({ id: doc.id, ...doc.data() });
    }
    catch (error) {
        return next(error);
    }
});
router.put('/:userId', (0, validation_1.validate)(validation_1.userValidationRules), async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { username, email, profilePicture, bannerPicture, bio, location, externalLinks, privacySettings, linkedSocialAccounts, preferences, } = req.body;
        await config_1.db.collection('users').doc(userId).update({
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
        return res.send({ message: 'User profile updated successfully' });
    }
    catch (error) {
        return next(error);
    }
});
router.post('/:userId/follow', async (req, res, next) => {
    try {
        const { userId } = req.params;
        const followerId = req.user?.id;
        if (!followerId) {
            return next(new AppError_1.default('Authentication required', 401));
        }
        if (userId === followerId) {
            return next(new AppError_1.default('Cannot follow yourself', 400));
        }
        const userToFollowRef = config_1.db.collection('users').doc(userId);
        const followerRef = config_1.db.collection('users').doc(followerId);
        const [userToFollowDoc, followerDoc] = await Promise.all([
            userToFollowRef.get(),
            followerRef.get(),
        ]);
        if (!userToFollowDoc.exists) {
            return next(new AppError_1.default('User to follow not found', 404));
        }
        if (!followerDoc.exists) {
            return next(new AppError_1.default('Follower user not found', 404));
        }
        const existingRelationship = await config_1.db
            .collection('relationships')
            .where('followerId', '==', followerId)
            .where('followingId', '==', userId)
            .limit(1)
            .get();
        if (!existingRelationship.empty) {
            return next(new AppError_1.default('Already following this user', 400));
        }
        await config_1.db.collection('relationships').add({
            followerId,
            followingId: userId,
            createdAt: new Date(),
        });
        await userToFollowRef.update({
            followersCount: (userToFollowDoc.data()?.followersCount || 0) + 1,
        });
        await followerRef.update({
            followingCount: (followerDoc.data()?.followingCount || 0) + 1,
        });
        return res.status(200).send({ message: 'User followed successfully' });
    }
    catch (error) {
        return next(error);
    }
});
router.post('/:userId/unfollow', async (req, res, next) => {
    try {
        const { userId } = req.params;
        const followerId = req.user?.id;
        if (!followerId) {
            return next(new AppError_1.default('Authentication required', 401));
        }
        const userToUnfollowRef = config_1.db.collection('users').doc(userId);
        const followerRef = config_1.db.collection('users').doc(followerId);
        const [userToUnfollowDoc, followerDoc] = await Promise.all([
            userToUnfollowRef.get(),
            followerRef.get(),
        ]);
        if (!userToUnfollowDoc.exists) {
            return next(new AppError_1.default('User to unfollow not found', 404));
        }
        if (!followerDoc.exists) {
            return next(new AppError_1.default('Follower user not found', 404));
        }
        const existingRelationship = await config_1.db
            .collection('relationships')
            .where('followerId', '==', followerId)
            .where('followingId', '==', userId)
            .limit(1)
            .get();
        if (existingRelationship.empty) {
            return next(new AppError_1.default('Not following this user', 400));
        }
        await config_1.db.collection('relationships').doc(existingRelationship.docs[0].id).delete();
        await userToUnfollowRef.update({
            followersCount: Math.max(0, (userToUnfollowDoc.data()?.followersCount || 0) - 1),
        });
        await followerRef.update({
            followingCount: Math.max(0, (followerDoc.data()?.followingCount || 0) - 1),
        });
        return res.status(200).send({ message: 'User unfollowed successfully' });
    }
    catch (error) {
        return next(error);
    }
});
router.get('/:userId/followers', async (req, res, next) => {
    try {
        const { userId } = req.params;
        const userDoc = await config_1.db.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            return next(new AppError_1.default('User not found', 404));
        }
        const followersSnapshot = await config_1.db
            .collection('relationships')
            .where('followingId', '==', userId)
            .get();
        const followerIds = followersSnapshot.docs.map((doc) => doc.data().followerId);
        if (followerIds.length === 0) {
            return res.status(200).send([]);
        }
        const followersPromises = followerIds.map((id) => config_1.db.collection('users').doc(id).get());
        const followersDocs = await Promise.all(followersPromises);
        const followers = followersDocs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                username: data?.username,
                profilePicture: data?.profilePicture,
            };
        });
        return res.status(200).send(followers);
    }
    catch (error) {
        return next(error);
    }
});
router.get('/:userId/following', async (req, res, next) => {
    try {
        const { userId } = req.params;
        const userDoc = await config_1.db.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            return next(new AppError_1.default('User not found', 404));
        }
        const followingSnapshot = await config_1.db
            .collection('relationships')
            .where('followerId', '==', userId)
            .get();
        const followingIds = followingSnapshot.docs.map((doc) => doc.data().followingId);
        if (followingIds.length === 0) {
            return res.status(200).send([]);
        }
        const followingPromises = followingIds.map((id) => config_1.db.collection('users').doc(id).get());
        const followingDocs = await Promise.all(followingPromises);
        const following = followingDocs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                username: data?.username,
                profilePicture: data?.profilePicture,
            };
        });
        return res.status(200).send(following);
    }
    catch (error) {
        return next(error);
    }
});
router.get('/:userId/settings', async (req, res, next) => {
    try {
        const doc = await config_1.db.collection('users').doc(req.params.userId).get();
        if (!doc.exists) {
            return next(new AppError_1.default('User not found', 404));
        }
        const settings = {
            dashboardLayout: doc.data()?.dashboardLayout || {},
            customTabs: doc.data()?.customTabs || [],
            themeSettings: doc.data()?.themeSettings || {},
        };
        return res.send(settings);
    }
    catch (error) {
        return next(error);
    }
});
router.put('/:userId/settings', async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { dashboardLayout, customTabs, themeSettings } = req.body;
        await config_1.db.collection('users').doc(userId).update({
            dashboardLayout,
            customTabs,
            themeSettings,
            updatedAt: new Date(),
        });
        return res.send({ message: 'User settings updated successfully' });
    }
    catch (error) {
        return next(error);
    }
});
exports.default = router;
//# sourceMappingURL=users.js.map