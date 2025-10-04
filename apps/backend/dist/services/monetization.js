"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAvailablePlans = getAvailablePlans;
exports.purchasePlan = purchasePlan;
function getAvailablePlans() {
    return [
        { id: 'basic', name: 'Basic', price: 0 },
        { id: 'pro', name: 'Pro', price: 9.99 },
        { id: 'creator', name: 'Creator', price: 29.99 },
    ];
}
function purchasePlan(userId, planId) {
    return { success: true, userId, planId };
}
//# sourceMappingURL=monetization.js.map