"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMedia = uploadMedia;
exports.getMediaUrl = getMediaUrl;
// Media service stub
function uploadMedia(_userId, _file) {
    // Simulate media upload
    return { success: true, url: 'https://cdn.jacameno.com/media/123.jpg' };
}
function getMediaUrl(mediaId) {
    // Simulate fetching media URL
    return "https://cdn.jacameno.com/media/".concat(mediaId, ".jpg");
}
