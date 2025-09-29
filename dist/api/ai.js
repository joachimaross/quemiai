"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const ai_1 = require("../services/ai");
const video_1 = require("../services/video");
const transcoder_1 = require("../services/transcoder");
const AppError_1 = __importDefault(require("../utils/AppError"));
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
router.post('/improve-text', (req, res, next) => {
    try {
        const { text } = req.body;
        if (!text) {
            return next(new AppError_1.default('Text is required', 400));
        }
        const result = (0, ai_1.improveText)(text);
        return res.send(result);
    }
    catch (error) {
        return next(error);
    }
});
router.post('/generate-captions', upload.single('file'), async (req, res, next) => {
    if (!req.file) {
        return next(new AppError_1.default('File is required', 400));
    }
    try {
        const captions = await (0, ai_1.generateCaptions)(req.file.path);
        return res.send({ captions });
    }
    catch (error) {
        return next(error);
    }
});
router.post('/advanced-recommendations', async (req, res, next) => {
    const { posts, likedPosts, userId } = req.body;
    if (!posts || !likedPosts || !userId) {
        return next(new AppError_1.default('posts, likedPosts, and userId are required', 400));
    }
    try {
        const engine = new ai_1.AdvancedRecommendationEngine();
        await engine.train(posts, likedPosts);
        const recommendations = await engine.getRecommendations(userId, posts);
        return res.send({ recommendations });
    }
    catch (error) {
        return next(error);
    }
});
router.post('/detect-video-labels', async (req, res, next) => {
    const { gcsUri } = req.body;
    if (!gcsUri) {
        return next(new AppError_1.default('Google Cloud Storage URI is required', 400));
    }
    try {
        const labels = await (0, video_1.detectLabelsInVideo)(gcsUri);
        return res.send({ labels });
    }
    catch (error) {
        return next(error);
    }
});
router.post('/music-integration', (req, res, next) => {
    try {
        const { trackId, videoId } = req.body;
        if (!trackId || !videoId) {
            return next(new AppError_1.default('trackId and videoId are required', 400));
        }
        // This is a placeholder for actual music integration logic
        return res.send({
            message: `Music track ${trackId} integrated with video ${videoId}`,
        });
    }
    catch (error) {
        return next(error);
    }
});
router.post('/transcode-video', async (req, res, next) => {
    const { inputUri, outputUri } = req.body;
    if (!inputUri || !outputUri) {
        return next(new AppError_1.default('inputUri and outputUri are required', 400));
    }
    try {
        const jobName = await (0, transcoder_1.createTranscodingJob)(inputUri, outputUri);
        return res.send({ jobName, message: 'Transcoding job started' });
    }
    catch (error) {
        return next(error);
    }
});
router.post('/chat-assistant', (req, res, next) => {
    try {
        const { message } = req.body;
        if (!message) {
            return next(new AppError_1.default('Message is required', 400));
        }
        // This is a placeholder for actual AI chat assistant logic
        const response = `You said: "${message}". I am an AI assistant. How can I help you further?`;
        return res.send({ response });
    }
    catch (error) {
        return next(error);
    }
});
exports.default = router;
