"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const config_1 = require("../config");
const router = (0, express_1.Router)();
router.get('/summary', async (_req, res, next) => {
    try {
        const snapshot = await config_1.db.collection('analytics').get();
        const analyticsData = snapshot.docs.map((doc) => doc.data());
        const summary = analyticsData.reduce((acc, data) => {
            acc[data.engagementType] = (acc[data.engagementType] || 0) + 1;
            return acc;
        }, {});
        return res.send(summary);
    }
    catch (error) {
        return next(error);
    }
});
router.get('/posts/:postId', (req, res) => {
    return res.send(`Get analytics for post ${req.params.postId}`);
});
exports.default = router;
//# sourceMappingURL=analytics.js.map