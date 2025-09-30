"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotification = sendNotification;
exports.getNotifications = getNotifications;
// Notifications service stub
function sendNotification(userId, message) {
    // Simulate sending a notification
    return { success: true, userId: userId, message: message };
}
function getNotifications(_userId) {
    // Simulate fetching notifications
    return [
        { id: '1', message: 'Welcome to Jacameno!', read: false },
        { id: '2', message: 'You have a new follower.', read: false },
    ];
}
