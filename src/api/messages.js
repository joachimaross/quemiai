"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var router = (0, express_1.Router)();
// Get all conversations
router.get('/', function (_req, res) {
    // TODO: Implement logic to get all conversations
    res.send('Get all conversations');
});
// Create a new conversation
router.post('/', function (_req, res) {
    // TODO: Implement logic to create a new conversation
    res.send('Create a new conversation');
});
// Get a specific conversation
router.get('/:conversationId', function (req, res) {
    // TODO: Implement logic to get a specific conversation
    res.send("Get conversation ".concat(req.params.conversationId));
});
// Send a message
router.post('/:conversationId/messages', function (req) {
    // TODO: Implement logic to send a message
    console.log("Send a message to conversation ".concat(req.params.conversationId));
});
exports.default = router;
