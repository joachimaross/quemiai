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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const config_1 = require("../config");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
// Get user profile
router.get('/:userId', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const doc = yield config_1.db.collection('users').doc(req.params.userId).get();
        if (!doc.exists) {
            return res.status(404).send({ error: 'User not found' });
        }
        res.send(Object.assign({ id: doc.id }, doc.data()));
    }
    catch (error) {
        next(error);
    }
}));
// Update user profile
router.put('/:userId', (0, validation_1.validate)(validation_1.userValidationRules), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const { username, email, profilePicture, bio, linkedSocialAccounts, preferences } = req.body;
        yield config_1.db.collection('users').doc(userId).update({
            username,
            email,
            profilePicture,
            bio,
            linkedSocialAccounts,
            preferences,
            updatedAt: new Date(),
        });
        res.send({ message: 'User profile updated successfully' });
    }
    catch (error) {
        next(error);
    }
}));
// Get user personalization settings
router.get('/:userId/settings', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const doc = yield config_1.db.collection('users').doc(req.params.userId).get();
        if (!doc.exists) {
            return res.status(404).send({ error: 'User not found' });
        }
        const settings = {
            dashboardLayout: ((_a = doc.data()) === null || _a === void 0 ? void 0 : _a.dashboardLayout) || {},
            customTabs: ((_b = doc.data()) === null || _b === void 0 ? void 0 : _b.customTabs) || [],
            themeSettings: ((_c = doc.data()) === null || _c === void 0 ? void 0 : _c.themeSettings) || {},
        };
        res.send(settings);
    }
    catch (error) {
        next(error);
    }
}));
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
        res.send({ message: 'User settings updated successfully' });
    }
    catch (error) {
        next(error);
    }
}));
exports.default = router;
