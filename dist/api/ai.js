"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
            next(new AppError_1.default('Text is required', 400));
            return;
        }
        const result = (0, ai_1.improveText)(text);
        res.send(result);
    }
    catch (error) {
        next(error);
    }
});
router.post('/generate-captions', upload.single('file'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.file) {
        next(new AppError_1.default('File is required', 400));
        return;
    }
    try {
        const captions = yield (0, ai_1.generateCaptions)(req.file.path);
        res.send({ captions });
    }
    catch (error) {
        next(error);
    }
}));
router.post('/advanced-recommendations', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { posts, likedPosts, userId } = req.body;
    if (!posts || !likedPosts || !userId) {
        next(new AppError_1.default('posts, likedPosts, and userId are required', 400));
        return;
    }
    try {
        const engine = new ai_1.AdvancedRecommendationEngine();
        yield engine.train(posts, likedPosts);
        const recommendations = yield engine.getRecommendations(userId, posts);
        res.send({ recommendations });
    }
    catch (error) {
        next(error);
    }
}));
router.post('/detect-video-labels', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { gcsUri } = req.body;
    if (!gcsUri) {
        next(new AppError_1.default('Google Cloud Storage URI is required', 400));
        return;
    }
    try {
        const labels = yield (0, video_1.detectLabelsInVideo)(gcsUri);
        res.send({ labels });
    }
    catch (error) {
        next(error);
    }
}));
router.post('/music-integration', (req, res, next) => {
    try {
        const { trackId, videoId } = req.body;
        if (!trackId || !videoId) {
            next(new AppError_1.default('trackId and videoId are required', 400));
            return;
        }
        // This is a placeholder for actual music integration logic
        res.send({ message: `Music track ${trackId} integrated with video ${videoId}` });
    }
    catch (error) {
        next(error);
    }
});
router.post('/transcode-video', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { inputUri, outputUri } = req.body;
    if (!inputUri || !outputUri) {
        next(new AppError_1.default('inputUri and outputUri are required', 400));
        return;
    }
    try {
        const jobName = yield (0, transcoder_1.createTranscodingJob)(inputUri, outputUri);
        res.send({ jobName, message: 'Transcoding job started' });
    }
    catch (error) {
        next(error);
    }
}));
router.post('/chat-assistant', (req, res, next) => {
    try {
        const { message } = req.body;
        if (!message) {
            next(new AppError_1.default('Message is required', 400));
            return;
        }
        // This is a placeholder for actual AI chat assistant logic
        const response = `You said: \"${message}\". I am an AI assistant. How can I help you further?`;
        res.send({ response });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
