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
exports.AdvancedRecommendationEngine = exports.generateCaptions = exports.improveText = void 0;
var compromise_1 = require("compromise");
var speech_1 = require("@google-cloud/speech");
var js_recommender_1 = require("js-recommender");
// Creates a client
var speechClient = new speech_1.SpeechClient();
var improveText = function (text) {
    var doc = (0, compromise_1.default)(text);
    var suggestions = [];
    // Suggest converting to past tense
    if (doc.verbs().has('#PresentTense')) {
        suggestions.push({
            type: 'Tense',
            message: 'Consider using past tense for storytelling.',
            suggestion: doc.verbs().toPastTense().out('text'),
        });
    }
    // Suggest converting to plural
    if (doc.nouns().has('#Singular')) {
        suggestions.push({
            type: 'Pluralization',
            message: 'Consider using the plural form.',
            suggestion: doc.nouns().toPlural().out('text'),
        });
    }
    // Suggest converting to singular
    if (doc.nouns().has('#Plural')) {
        suggestions.push({
            type: 'Singularization',
            message: 'Consider using the singular form.',
            suggestion: doc.nouns().toSingular().out('text'),
        });
    }
    // Suggest negating the sentence
    suggestions.push({
        type: 'Negation',
        message: 'Consider negating the sentence.',
        suggestion: doc.sentences().toNegative().out('text'),
    });
    return {
        original: text,
        suggestions: suggestions,
    };
};
exports.improveText = improveText;
var generateCaptions = function (filePath) { return __awaiter(void 0, void 0, void 0, function () {
    var audio, config, request, response, transcription;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                audio = {
                    uri: filePath,
                };
                config = {
                    encoding: 'LINEAR16',
                    sampleRateHertz: 16000,
                    languageCode: 'en-US',
                };
                request = {
                    audio: audio,
                    config: config,
                };
                return [4 /*yield*/, speechClient.recognize(request)];
            case 1:
                response = (_b.sent())[0];
                transcription = (_a = response.results) === null || _a === void 0 ? void 0 : _a.map(function (result) { var _a, _b; return (_b = (_a = result.alternatives) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.transcript; }).join('\n');
                return [2 /*return*/, transcription];
        }
    });
}); };
exports.generateCaptions = generateCaptions;
var AdvancedRecommendationEngine = /** @class */ (function () {
    function AdvancedRecommendationEngine() {
        this.recommender = new js_recommender_1.default();
    }
    AdvancedRecommendationEngine.prototype.train = function (posts, likedPosts) {
        var ratings = {};
        var _loop_1 = function (post) {
            if (!ratings[post.userId]) {
                ratings[post.userId] = {};
            }
            var liked = likedPosts.some(function (p) { return p.id === post.id && p.userId === post.userId; });
            ratings[post.userId][post.id] = liked ? 1 : 0;
        };
        for (var _i = 0, posts_1 = posts; _i < posts_1.length; _i++) {
            var post = posts_1[_i];
            _loop_1(post);
        }
        this.recommender.input(ratings);
        this.recommender.transform();
    };
    AdvancedRecommendationEngine.prototype.getRecommendations = function (userId, posts) {
        var recommendations = this.recommender.recommend(userId);
        var recommendedPosts = recommendations.map(function (recommendation) {
            return posts.find(function (post) { return post.id === recommendation.item; });
        });
        return recommendedPosts;
    };
    return AdvancedRecommendationEngine;
}());
exports.AdvancedRecommendationEngine = AdvancedRecommendationEngine;
