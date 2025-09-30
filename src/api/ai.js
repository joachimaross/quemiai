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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var multer_1 = require("multer");
var ai_1 = require("../services/ai");
var video_1 = require("../services/video");
var transcoder_1 = require("../services/transcoder");
var AppError_1 = require("../utils/AppError");
var router = (0, express_1.Router)();
var upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
router.post('/improve-text', function (req, res, next) {
    try {
        var text = req.body.text;
        if (!text) {
            return next(new AppError_1.default('Text is required', 400));
        }
        var result = (0, ai_1.improveText)(text);
        return res.send(result);
    }
    catch (error) {
        return next(error);
    }
});
router.post('/generate-captions', upload.single('file'), function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var captions, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!req.file) {
                    return [2 /*return*/, next(new AppError_1.default('File is required', 400))];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, (0, ai_1.generateCaptions)(req.file.path)];
            case 2:
                captions = _a.sent();
                return [2 /*return*/, res.send({ captions: captions })];
            case 3:
                error_1 = _a.sent();
                return [2 /*return*/, next(error_1)];
            case 4: return [2 /*return*/];
        }
    });
}); });
router.post('/advanced-recommendations', function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, posts, likedPosts, userId, engine, recommendations, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, posts = _a.posts, likedPosts = _a.likedPosts, userId = _a.userId;
                if (!posts || !likedPosts || !userId) {
                    return [2 /*return*/, next(new AppError_1.default('posts, likedPosts, and userId are required', 400))];
                }
                _b.label = 1;
            case 1:
                _b.trys.push([1, 4, , 5]);
                engine = new ai_1.AdvancedRecommendationEngine();
                return [4 /*yield*/, engine.train(posts, likedPosts)];
            case 2:
                _b.sent();
                return [4 /*yield*/, engine.getRecommendations(userId, posts)];
            case 3:
                recommendations = _b.sent();
                return [2 /*return*/, res.send({ recommendations: recommendations })];
            case 4:
                error_2 = _b.sent();
                return [2 /*return*/, next(error_2)];
            case 5: return [2 /*return*/];
        }
    });
}); });
router.post('/detect-video-labels', function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var gcsUri, labels, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                gcsUri = req.body.gcsUri;
                if (!gcsUri) {
                    return [2 /*return*/, next(new AppError_1.default('Google Cloud Storage URI is required', 400))];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, (0, video_1.detectLabelsInVideo)(gcsUri)];
            case 2:
                labels = _a.sent();
                return [2 /*return*/, res.send({ labels: labels })];
            case 3:
                error_3 = _a.sent();
                return [2 /*return*/, next(error_3)];
            case 4: return [2 /*return*/];
        }
    });
}); });
router.post('/music-integration', function (req, res, next) {
    try {
        var _a = req.body, trackId = _a.trackId, videoId = _a.videoId;
        if (!trackId || !videoId) {
            return next(new AppError_1.default('trackId and videoId are required', 400));
        }
        // This is a placeholder for actual music integration logic
        return res.send({
            message: "Music track ".concat(trackId, " integrated with video ").concat(videoId),
        });
    }
    catch (error) {
        return next(error);
    }
});
router.post('/transcode-video', function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, inputUri, outputUri, jobName, error_4;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, inputUri = _a.inputUri, outputUri = _a.outputUri;
                if (!inputUri || !outputUri) {
                    return [2 /*return*/, next(new AppError_1.default('inputUri and outputUri are required', 400))];
                }
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                return [4 /*yield*/, (0, transcoder_1.createTranscodingJob)(inputUri, outputUri)];
            case 2:
                jobName = _b.sent();
                return [2 /*return*/, res.send({ jobName: jobName, message: 'Transcoding job started' })];
            case 3:
                error_4 = _b.sent();
                return [2 /*return*/, next(error_4)];
            case 4: return [2 /*return*/];
        }
    });
}); });
router.post('/chat-assistant', function (req, res, next) {
    try {
        var message = req.body.message;
        if (!message) {
            return next(new AppError_1.default('Message is required', 400));
        }
        // This is a placeholder for actual AI chat assistant logic
        var response = "You said: \"".concat(message, "\". I am an AI assistant. How can I help you further?");
        return res.send({ response: response });
    }
    catch (error) {
        return next(error);
    }
});
exports.default = router;
