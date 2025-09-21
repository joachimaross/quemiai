"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
// Get all conversations
router.get('/', (_req, res) => {
    // TODO: Implement logic to get all conversations
    res.send('Get all conversations');
});
// Create a new conversation
router.post('/', (_req, res) => {
    // TODO: Implement logic to create a new conversation
    res.send('Create a new conversation');
});
// Get a specific conversation
router.get('/:conversationId', (req, res) => {
    // TODO: Implement logic to get a specific conversation
    res.send(`Get conversation ${req.params.conversationId}`);
});
// Send a message
router.post('/:conversationId/messages', (req, res) => {
    // TODO: Implement logic to send a message
    res.send(`Send a message to conversation ${req.params.conversationId}`);
});
exports.default = router;
