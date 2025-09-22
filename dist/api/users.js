"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const config_1 = require("../config");
const validation_1 = require("../middleware/validation");
const AppError_1 = __importDefault(require("../utils/AppError"));
const router = (0, express_1.Router)();
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
router.get('/:userId', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const doc = yield config_1.db.collection('users').doc(req.params.userId).get();
        if (!doc.exists) {
            return next(new AppError_1.default('User not found', 404));
        }
        return res.send(Object.assign({ id: doc.id }, doc.data()));
    }
    catch (error) {
        return next(error);
    }
}));
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
router.put('/:userId', (0, validation_1.validate)(validation_1.userValidationRules), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const { username, email, profilePicture, bannerPicture, bio, location, externalLinks, privacySettings, linkedSocialAccounts, preferences, } = req.body;
        yield config_1.db.collection('users').doc(userId).update({
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
}));
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
router.post('/:userId/follow', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { userId } = req.params; // The user to follow
        const followerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!followerId) {
            return next(new AppError_1.default('Authentication required', 401));
        }
        if (userId === followerId) {
            return next(new AppError_1.default('Cannot follow yourself', 400));
        }
        const userToFollowRef = config_1.db.collection('users').doc(userId);
        const followerRef = config_1.db.collection('users').doc(followerId);
        const [userToFollowDoc, followerDoc] = yield Promise.all([
            userToFollowRef.get(),
            followerRef.get(),
        ]);
        if (!userToFollowDoc.exists) {
            return next(new AppError_1.default('User to follow not found', 404));
        }
        if (!followerDoc.exists) {
            return next(new AppError_1.default('Follower user not found', 404));
        }
        // Check if already following
        const existingRelationship = yield config_1.db
            .collection('relationships')
            .where('followerId', '==', followerId)
            .where('followingId', '==', userId)
            .limit(1)
            .get();
        if (!existingRelationship.empty) {
            return next(new AppError_1.default('Already following this user', 400));
        }
        // Create relationship
        yield config_1.db.collection('relationships').add({
            followerId,
            followingId: userId,
            createdAt: new Date(),
        });
        // Update follower/following counts atomically
        yield userToFollowRef.update({
            followersCount: (((_b = userToFollowDoc.data()) === null || _b === void 0 ? void 0 : _b.followersCount) || 0) + 1,
        });
        yield followerRef.update({
            followingCount: (((_c = followerDoc.data()) === null || _c === void 0 ? void 0 : _c.followingCount) || 0) + 1,
        });
        return res.status(200).send({ message: 'User followed successfully' });
    }
    catch (error) {
        return next(error);
    }
}));
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
router.post('/:userId/unfollow', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _d, _e, _f;
    try {
        const { userId } = req.params; // The user to unfollow
        const followerId = (_d = req.user) === null || _d === void 0 ? void 0 : _d.id;
        if (!followerId) {
            return next(new AppError_1.default('Authentication required', 401));
        }
        const userToUnfollowRef = config_1.db.collection('users').doc(userId);
        const followerRef = config_1.db.collection('users').doc(followerId);
        const [userToUnfollowDoc, followerDoc] = yield Promise.all([
            userToUnfollowRef.get(),
            followerRef.get(),
        ]);
        if (!userToUnfollowDoc.exists) {
            return next(new AppError_1.default('User to unfollow not found', 404));
        }
        if (!followerDoc.exists) {
            return next(new AppError_1.default('Follower user not found', 404));
        }
        // Find relationship
        const existingRelationship = yield config_1.db
            .collection('relationships')
            .where('followerId', '==', followerId)
            .where('followingId', '==', userId)
            .limit(1)
            .get();
        if (existingRelationship.empty) {
            return next(new AppError_1.default('Not following this user', 400));
        }
        // Delete relationship
        yield config_1.db.collection('relationships').doc(existingRelationship.docs[0].id).delete();
        // Update follower/following counts atomically
        yield userToUnfollowRef.update({
            followersCount: Math.max(0, (((_e = userToUnfollowDoc.data()) === null || _e === void 0 ? void 0 : _e.followersCount) || 0) - 1),
        });
        yield followerRef.update({
            followingCount: Math.max(0, (((_f = followerDoc.data()) === null || _f === void 0 ? void 0 : _f.followingCount) || 0) - 1),
        });
        return res.status(200).send({ message: 'User unfollowed successfully' });
    }
    catch (error) {
        return next(error);
    }
}));
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
router.get('/:userId/followers', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const userDoc = yield config_1.db.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            return next(new AppError_1.default('User not found', 404));
        }
        const followersSnapshot = yield config_1.db
            .collection('relationships')
            .where('followingId', '==', userId)
            .get();
        const followerIds = followersSnapshot.docs.map((doc) => doc.data().followerId);
        if (followerIds.length === 0) {
            return res.status(200).send([]);
        }
        // Fetch follower details
        const followersPromises = followerIds.map((id) => config_1.db.collection('users').doc(id).get());
        const followersDocs = yield Promise.all(followersPromises);
        const followers = followersDocs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                username: data === null || data === void 0 ? void 0 : data.username,
                profilePicture: data === null || data === void 0 ? void 0 : data.profilePicture,
            };
        });
        return res.status(200).send(followers);
    }
    catch (error) {
        return next(error);
    }
}));
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
router.get('/:userId/following', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const userDoc = yield config_1.db.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            return next(new AppError_1.default('User not found', 404));
        }
        const followingSnapshot = yield config_1.db
            .collection('relationships')
            .where('followerId', '==', userId)
            .get();
        const followingIds = followingSnapshot.docs.map((doc) => doc.data().followingId);
        if (followingIds.length === 0) {
            return res.status(200).send([]);
        }
        // Fetch following details
        const followingPromises = followingIds.map((id) => config_1.db.collection('users').doc(id).get());
        const followingDocs = yield Promise.all(followingPromises);
        const following = followingDocs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                username: data === null || data === void 0 ? void 0 : data.username,
                profilePicture: data === null || data === void 0 ? void 0 : data.profilePicture,
            };
        });
        return res.status(200).send(following);
    }
    catch (error) {
        return next(error);
    }
}));
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
router.get('/:userId/settings', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _g, _h, _j;
    try {
        const doc = yield config_1.db.collection('users').doc(req.params.userId).get();
        if (!doc.exists) {
            return next(new AppError_1.default('User not found', 404));
        }
        const settings = {
            dashboardLayout: ((_g = doc.data()) === null || _g === void 0 ? void 0 : _g.dashboardLayout) || {},
            customTabs: ((_h = doc.data()) === null || _h === void 0 ? void 0 : _h.customTabs) || [],
            themeSettings: ((_j = doc.data()) === null || _j === void 0 ? void 0 : _j.themeSettings) || {},
        };
        return res.send(settings);
    }
    catch (error) {
        return next(error);
    }
}));
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
router.put('/:userId/settings', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const { dashboardLayout, customTabs, themeSettings } = req.body;
        yield config_1.db.collection('users').doc(userId).update({
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
}));
exports.default = router;
