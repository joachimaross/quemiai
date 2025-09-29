"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var express_1 = require("express");
var config_1 = require("../config");
var validation_1 = require("../middleware/validation");
var AppError_1 = require("../utils/AppError");
var router = (0, express_1.Router)();
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
router.get('/:userId', function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var doc, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, config_1.db.collection('users').doc(req.params.userId).get()];
            case 1:
                doc = _a.sent();
                if (!doc.exists) {
                    return [2 /*return*/, next(new AppError_1["default"]('User not found', 404))];
                }
                return [2 /*return*/, res.send(__assign({ id: doc.id }, doc.data()))];
            case 2:
                error_1 = _a.sent();
                return [2 /*return*/, next(error_1)];
            case 3: return [2 /*return*/];
        }
    });
}); });
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
router.put('/:userId', (0, validation_1.validate)(validation_1.userValidationRules), function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, _a, username, email, profilePicture, bannerPicture, bio, location_1, externalLinks, privacySettings, linkedSocialAccounts, preferences, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                userId = req.params.userId;
                _a = req.body, username = _a.username, email = _a.email, profilePicture = _a.profilePicture, bannerPicture = _a.bannerPicture, bio = _a.bio, location_1 = _a.location, externalLinks = _a.externalLinks, privacySettings = _a.privacySettings, linkedSocialAccounts = _a.linkedSocialAccounts, preferences = _a.preferences;
                return [4 /*yield*/, config_1.db.collection('users').doc(userId).update({
                        username: username,
                        email: email,
                        profilePicture: profilePicture,
                        bannerPicture: bannerPicture,
                        bio: bio,
                        location: location_1,
                        externalLinks: externalLinks,
                        privacySettings: privacySettings,
                        linkedSocialAccounts: linkedSocialAccounts,
                        preferences: preferences,
                        updatedAt: new Date()
                    })];
            case 1:
                _b.sent();
                return [2 /*return*/, res.send({ message: 'User profile updated successfully' })];
            case 2:
                error_2 = _b.sent();
                return [2 /*return*/, next(error_2)];
            case 3: return [2 /*return*/];
        }
    });
}); });
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
router.post('/:userId/follow', function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, followerId, userToFollowRef, followerRef, _a, userToFollowDoc, followerDoc, existingRelationship, error_3;
    var _b, _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _e.trys.push([0, 6, , 7]);
                userId = req.params.userId;
                followerId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
                if (!followerId) {
                    return [2 /*return*/, next(new AppError_1["default"]('Authentication required', 401))];
                }
                if (userId === followerId) {
                    return [2 /*return*/, next(new AppError_1["default"]('Cannot follow yourself', 400))];
                }
                userToFollowRef = config_1.db.collection('users').doc(userId);
                followerRef = config_1.db.collection('users').doc(followerId);
                return [4 /*yield*/, Promise.all([
                        userToFollowRef.get(),
                        followerRef.get(),
                    ])];
            case 1:
                _a = _e.sent(), userToFollowDoc = _a[0], followerDoc = _a[1];
                if (!userToFollowDoc.exists) {
                    return [2 /*return*/, next(new AppError_1["default"]('User to follow not found', 404))];
                }
                if (!followerDoc.exists) {
                    return [2 /*return*/, next(new AppError_1["default"]('Follower user not found', 404))];
                }
                return [4 /*yield*/, config_1.db
                        .collection('relationships')
                        .where('followerId', '==', followerId)
                        .where('followingId', '==', userId)
                        .limit(1)
                        .get()];
            case 2:
                existingRelationship = _e.sent();
                if (!existingRelationship.empty) {
                    return [2 /*return*/, next(new AppError_1["default"]('Already following this user', 400))];
                }
                // Create relationship
                return [4 /*yield*/, config_1.db.collection('relationships').add({
                        followerId: followerId,
                        followingId: userId,
                        createdAt: new Date()
                    })];
            case 3:
                // Create relationship
                _e.sent();
                // Update follower/following counts atomically
                return [4 /*yield*/, userToFollowRef.update({
                        followersCount: (((_c = userToFollowDoc.data()) === null || _c === void 0 ? void 0 : _c.followersCount) || 0) + 1
                    })];
            case 4:
                // Update follower/following counts atomically
                _e.sent();
                return [4 /*yield*/, followerRef.update({
                        followingCount: (((_d = followerDoc.data()) === null || _d === void 0 ? void 0 : _d.followingCount) || 0) + 1
                    })];
            case 5:
                _e.sent();
                return [2 /*return*/, res.status(200).send({ message: 'User followed successfully' })];
            case 6:
                error_3 = _e.sent();
                return [2 /*return*/, next(error_3)];
            case 7: return [2 /*return*/];
        }
    });
}); });
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
router.post('/:userId/unfollow', function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, followerId, userToUnfollowRef, followerRef, _a, userToUnfollowDoc, followerDoc, existingRelationship, error_4;
    var _b, _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _e.trys.push([0, 6, , 7]);
                userId = req.params.userId;
                followerId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
                if (!followerId) {
                    return [2 /*return*/, next(new AppError_1["default"]('Authentication required', 401))];
                }
                userToUnfollowRef = config_1.db.collection('users').doc(userId);
                followerRef = config_1.db.collection('users').doc(followerId);
                return [4 /*yield*/, Promise.all([
                        userToUnfollowRef.get(),
                        followerRef.get(),
                    ])];
            case 1:
                _a = _e.sent(), userToUnfollowDoc = _a[0], followerDoc = _a[1];
                if (!userToUnfollowDoc.exists) {
                    return [2 /*return*/, next(new AppError_1["default"]('User to unfollow not found', 404))];
                }
                if (!followerDoc.exists) {
                    return [2 /*return*/, next(new AppError_1["default"]('Follower user not found', 404))];
                }
                return [4 /*yield*/, config_1.db
                        .collection('relationships')
                        .where('followerId', '==', followerId)
                        .where('followingId', '==', userId)
                        .limit(1)
                        .get()];
            case 2:
                existingRelationship = _e.sent();
                if (existingRelationship.empty) {
                    return [2 /*return*/, next(new AppError_1["default"]('Not following this user', 400))];
                }
                // Delete relationship
                return [4 /*yield*/, config_1.db.collection('relationships').doc(existingRelationship.docs[0].id)["delete"]()];
            case 3:
                // Delete relationship
                _e.sent();
                // Update follower/following counts atomically
                return [4 /*yield*/, userToUnfollowRef.update({
                        followersCount: Math.max(0, (((_c = userToUnfollowDoc.data()) === null || _c === void 0 ? void 0 : _c.followersCount) || 0) - 1)
                    })];
            case 4:
                // Update follower/following counts atomically
                _e.sent();
                return [4 /*yield*/, followerRef.update({
                        followingCount: Math.max(0, (((_d = followerDoc.data()) === null || _d === void 0 ? void 0 : _d.followingCount) || 0) - 1)
                    })];
            case 5:
                _e.sent();
                return [2 /*return*/, res.status(200).send({ message: 'User unfollowed successfully' })];
            case 6:
                error_4 = _e.sent();
                return [2 /*return*/, next(error_4)];
            case 7: return [2 /*return*/];
        }
    });
}); });
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
router.get('/:userId/followers', function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, userDoc, followersSnapshot, followerIds, followersPromises, followersDocs, followers, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                userId = req.params.userId;
                return [4 /*yield*/, config_1.db.collection('users').doc(userId).get()];
            case 1:
                userDoc = _a.sent();
                if (!userDoc.exists) {
                    return [2 /*return*/, next(new AppError_1["default"]('User not found', 404))];
                }
                return [4 /*yield*/, config_1.db
                        .collection('relationships')
                        .where('followingId', '==', userId)
                        .get()];
            case 2:
                followersSnapshot = _a.sent();
                followerIds = followersSnapshot.docs.map(function (doc) { return doc.data().followerId; });
                if (followerIds.length === 0) {
                    return [2 /*return*/, res.status(200).send([])];
                }
                followersPromises = followerIds.map(function (id) { return config_1.db.collection('users').doc(id).get(); });
                return [4 /*yield*/, Promise.all(followersPromises)];
            case 3:
                followersDocs = _a.sent();
                followers = followersDocs.map(function (doc) {
                    var data = doc.data();
                    return {
                        id: doc.id,
                        username: data === null || data === void 0 ? void 0 : data.username,
                        profilePicture: data === null || data === void 0 ? void 0 : data.profilePicture
                    };
                });
                return [2 /*return*/, res.status(200).send(followers)];
            case 4:
                error_5 = _a.sent();
                return [2 /*return*/, next(error_5)];
            case 5: return [2 /*return*/];
        }
    });
}); });
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
router.get('/:userId/following', function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, userDoc, followingSnapshot, followingIds, followingPromises, followingDocs, following, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                userId = req.params.userId;
                return [4 /*yield*/, config_1.db.collection('users').doc(userId).get()];
            case 1:
                userDoc = _a.sent();
                if (!userDoc.exists) {
                    return [2 /*return*/, next(new AppError_1["default"]('User not found', 404))];
                }
                return [4 /*yield*/, config_1.db
                        .collection('relationships')
                        .where('followerId', '==', userId)
                        .get()];
            case 2:
                followingSnapshot = _a.sent();
                followingIds = followingSnapshot.docs.map(function (doc) { return doc.data().followingId; });
                if (followingIds.length === 0) {
                    return [2 /*return*/, res.status(200).send([])];
                }
                followingPromises = followingIds.map(function (id) { return config_1.db.collection('users').doc(id).get(); });
                return [4 /*yield*/, Promise.all(followingPromises)];
            case 3:
                followingDocs = _a.sent();
                following = followingDocs.map(function (doc) {
                    var data = doc.data();
                    return {
                        id: doc.id,
                        username: data === null || data === void 0 ? void 0 : data.username,
                        profilePicture: data === null || data === void 0 ? void 0 : data.profilePicture
                    };
                });
                return [2 /*return*/, res.status(200).send(following)];
            case 4:
                error_6 = _a.sent();
                return [2 /*return*/, next(error_6)];
            case 5: return [2 /*return*/];
        }
    });
}); });
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
router.get('/:userId/settings', function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var doc, settings, error_7;
    var _a, _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 2, , 3]);
                return [4 /*yield*/, config_1.db.collection('users').doc(req.params.userId).get()];
            case 1:
                doc = _d.sent();
                if (!doc.exists) {
                    return [2 /*return*/, next(new AppError_1["default"]('User not found', 404))];
                }
                settings = {
                    dashboardLayout: ((_a = doc.data()) === null || _a === void 0 ? void 0 : _a.dashboardLayout) || {},
                    customTabs: ((_b = doc.data()) === null || _b === void 0 ? void 0 : _b.customTabs) || [],
                    themeSettings: ((_c = doc.data()) === null || _c === void 0 ? void 0 : _c.themeSettings) || {}
                };
                return [2 /*return*/, res.send(settings)];
            case 2:
                error_7 = _d.sent();
                return [2 /*return*/, next(error_7)];
            case 3: return [2 /*return*/];
        }
    });
}); });
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
router.put('/:userId/settings', function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, _a, dashboardLayout, customTabs, themeSettings, error_8;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                userId = req.params.userId;
                _a = req.body, dashboardLayout = _a.dashboardLayout, customTabs = _a.customTabs, themeSettings = _a.themeSettings;
                return [4 /*yield*/, config_1.db.collection('users').doc(userId).update({
                        dashboardLayout: dashboardLayout,
                        customTabs: customTabs,
                        themeSettings: themeSettings,
                        updatedAt: new Date()
                    })];
            case 1:
                _b.sent();
                return [2 /*return*/, res.send({ message: 'User settings updated successfully' })];
            case 2:
                error_8 = _b.sent();
                return [2 /*return*/, next(error_8)];
            case 3: return [2 /*return*/];
        }
    });
}); });
exports["default"] = router;
