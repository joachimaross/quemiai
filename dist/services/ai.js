"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdvancedRecommendationEngine = exports.generateCaptions = exports.improveText = void 0;
const compromise_1 = __importDefault(require("compromise"));
const speech_1 = require("@google-cloud/speech");
const Recommender = __importStar(require("js-recommender"));
// Creates a client
const speechClient = new speech_1.SpeechClient();
const improveText = (text) => {
    const doc = (0, compromise_1.default)(text);
    const suggestions = [];
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
        suggestions,
    };
};
exports.improveText = improveText;
const generateCaptions = async (filePath) => {
    var _a;
    const audio = {
        uri: filePath,
    };
    const config = {
        encoding: 'LINEAR16',
        sampleRateHertz: 16000,
        languageCode: 'en-US',
    };
    const request = {
        audio: audio,
        config: config,
    };
    // Detects speech in the audio file
    const [response] = await speechClient.recognize(request);
    const transcription = (_a = response.results) === null || _a === void 0 ? void 0 : _a.map((result) => { var _a, _b; return (_b = (_a = result.alternatives) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.transcript; }).join('\n');
    return transcription;
};
exports.generateCaptions = generateCaptions;
class AdvancedRecommendationEngine {
    constructor() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.recommender = new Recommender.Recommender();
    }
    train(posts, likedPosts) {
        const ratings = {};
        for (const post of posts) {
            if (!ratings[post.userId]) {
                ratings[post.userId] = {};
            }
            const liked = likedPosts.some((p) => p.id === post.id && p.userId === post.userId);
            ratings[post.userId][post.id] = liked ? 1 : 0;
        }
        this.recommender.input(ratings);
        this.recommender.transform();
    }
    getRecommendations(userId, posts) {
        const recommendations = this.recommender.recommend(userId);
        const recommendedPosts = recommendations.map((recommendation) => {
            return posts.find((post) => post.id === recommendation.item);
        });
        return recommendedPosts;
    }
}
exports.AdvancedRecommendationEngine = AdvancedRecommendationEngine;
