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
exports.AdvancedRecommendationEngine = exports.generateCaptions = exports.improveText = void 0;
const compromise_1 = __importDefault(require("compromise"));
const speech_1 = require("@google-cloud/speech");
const js_recommender_1 = require("js-recommender");
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
const generateCaptions = (filePath) => __awaiter(void 0, void 0, void 0, function* () {
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
    const [response] = yield speechClient.recognize(request);
    const transcription = (_a = response.results) === null || _a === void 0 ? void 0 : _a.map((result) => { var _a, _b; return (_b = (_a = result.alternatives) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.transcript; }).join('\n');
    return transcription;
});
exports.generateCaptions = generateCaptions;
class AdvancedRecommendationEngine {
    constructor() {
        this.recommender = new js_recommender_1.Recommender();
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
