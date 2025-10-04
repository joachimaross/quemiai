"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get('/', (_req, res) => {
    res.send('Get all conversations');
});
router.post('/', (_req, res) => {
    res.send('Create a new conversation');
});
router.get('/:conversationId', (req, res) => {
    res.send(`Get conversation ${req.params.conversationId}`);
});
router.post('/:conversationId/messages', (req) => {
    console.log(`Send a message to conversation ${req.params.conversationId}`);
});
exports.default = router;
//# sourceMappingURL=messages.js.map