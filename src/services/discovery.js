"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTrendingHashtags = getTrendingHashtags;
exports.getSuggestedPeople = getSuggestedPeople;
// Discovery service stub
function getTrendingHashtags() {
    return ['#nextjs', '#cyberpunk', '#ai', '#music', '#gaming'];
}
function getSuggestedPeople() {
    return [
        { id: '1', name: 'Alice', avatarUrl: '/avatar1.png' },
        { id: '2', name: 'Bob', avatarUrl: '/avatar2.png' },
        { id: '3', name: 'Charlie', avatarUrl: '/avatar4.png' },
    ];
}
