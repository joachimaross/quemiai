"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMedia = uploadMedia;
exports.getMediaUrl = getMediaUrl;
function uploadMedia(_userId, _file) {
    return { success: true, url: 'https://cdn.jacameno.com/media/123.jpg' };
}
function getMediaUrl(mediaId) {
    return `https://cdn.jacameno.com/media/${mediaId}.jpg`;
}
//# sourceMappingURL=media.js.map