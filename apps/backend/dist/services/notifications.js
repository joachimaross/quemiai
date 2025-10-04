"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotification = sendNotification;
exports.getNotifications = getNotifications;
function sendNotification(_userId, message) {
    return { success: true, userId: _userId, message };
}
function getNotifications(_userId) {
    return [
        { id: '1', message: 'Welcome to Jacameno!', read: false },
        { id: '2', message: 'You have a new follower.', read: false },
    ];
}
//# sourceMappingURL=notifications.js.map