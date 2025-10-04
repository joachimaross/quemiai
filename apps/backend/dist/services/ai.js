"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdvancedRecommendationEngine = exports.generateCaptions = exports.improveText = void 0;
const compromise_1 = __importDefault(require("compromise"));
const speech_1 = require("@google-cloud/speech");
const Recommender = require("js-recommender");
const speechClient = new speech_1.SpeechClient();
const improveText = (text) => {
    const doc = (0, compromise_1.default)(text);
    const suggestions = [];
    if (doc.verbs().has('#PresentTense')) {
        suggestions.push({
            type: 'Tense',
            message: 'Consider using past tense for storytelling.',
            suggestion: doc.verbs().toPastTense().out('text'),
        });
    }
    if (doc.nouns().has('#Singular')) {
        suggestions.push({
            type: 'Pluralization',
            message: 'Consider using the plural form.',
            suggestion: doc.nouns().toPlural().out('text'),
        });
    }
    if (doc.nouns().has('#Plural')) {
        suggestions.push({
            type: 'Singularization',
            message: 'Consider using the singular form.',
            suggestion: doc.nouns().toSingular().out('text'),
        });
    }
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
    const [response] = await speechClient.recognize(request);
    const transcription = response.results
        ?.map((result) => result.alternatives?.[0]?.transcript)
        .join('\n');
    return transcription;
};
exports.generateCaptions = generateCaptions;
class AdvancedRecommendationEngine {
    constructor() {
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
//# sourceMappingURL=ai.js.map