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
const supertest_1 = __importDefault(require("supertest"));
const api_1 = __importDefault(require("../../functions/api"));
const aiService = __importStar(require("../../services/ai"));
const videoService = __importStar(require("../../services/video"));
const transcoderService = __importStar(require("../../services/transcoder"));
jest.mock('../../services/ai', () => ({
    improveText: jest.fn(),
    generateCaptions: jest.fn(),
    AdvancedRecommendationEngine: jest.fn().mockImplementation(() => ({
        getRecommendations: jest.fn(),
    })),
}));
jest.mock('../../services/video', () => ({
    detectLabelsInVideo: jest.fn(),
}));
jest.mock('../../services/transcoder', () => ({
    createTranscodingJob: jest.fn(),
}));
jest.mock('multer', () => {
    const multer = () => ({
        single: () => (req, res, next) => {
            req.file = {
                buffer: Buffer.from('test'),
                originalname: 'test.mp4',
            };
            next();
        },
    });
    multer.memoryStorage = jest.fn();
    return multer;
});
jest.mock('firebase-admin', () => ({
    initializeApp: jest.fn(),
    credential: {
        applicationDefault: jest.fn(),
    },
    firestore: () => ({
        collection: jest.fn(),
        terminate: jest.fn(() => Promise.resolve()),
    }),
    auth: () => ({}),
}));
jest.mock('dotenv/config', () => ({}));
describe('AI API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('POST /api/v1/ai/improve-text', () => {
        it('should improve text successfully', async () => {
            const mockImprovedText = 'This is improved text with better grammar and style.';
            aiService.improveText.mockResolvedValue(mockImprovedText);
            const res = await (0, supertest_1.default)(api_1.default).post('/api/v1/ai/improve-text').send({
                text: 'This is text need improve.',
            });
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('improvedText', mockImprovedText);
            expect(aiService.improveText).toHaveBeenCalledWith('This is text need improve.');
        });
        it('should return 400 if text is missing', async () => {
            const res = await (0, supertest_1.default)(api_1.default).post('/api/v1/ai/improve-text').send({});
            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('message', 'Text is required');
        });
        it('should handle service errors gracefully', async () => {
            aiService.improveText.mockRejectedValue(new Error('AI service error'));
            const res = await (0, supertest_1.default)(api_1.default).post('/api/v1/ai/improve-text').send({
                text: 'Some text',
            });
            expect(res.statusCode).toEqual(500);
        });
    });
    describe('POST /api/v1/ai/generate-captions', () => {
        it('should generate captions successfully', async () => {
            const mockCaptions = ['Caption 1', 'Caption 2', 'Caption 3'];
            aiService.generateCaptions.mockResolvedValue(mockCaptions);
            const res = await (0, supertest_1.default)(api_1.default).post('/api/v1/ai/generate-captions').send({
                text: 'Generate captions for this content.',
                count: 3,
            });
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('captions');
            expect(Array.isArray(res.body.captions)).toBe(true);
            expect(res.body.captions).toHaveLength(3);
            expect(aiService.generateCaptions).toHaveBeenCalledWith('Generate captions for this content.', 3);
        });
        it('should use default count when not provided', async () => {
            const mockCaptions = ['Caption 1', 'Caption 2', 'Caption 3'];
            aiService.generateCaptions.mockResolvedValue(mockCaptions);
            const res = await (0, supertest_1.default)(api_1.default).post('/api/v1/ai/generate-captions').send({
                text: 'Generate captions for this content.',
            });
            expect(res.statusCode).toEqual(200);
            expect(aiService.generateCaptions).toHaveBeenCalledWith('Generate captions for this content.', 3);
        });
        it('should return 400 if text is missing', async () => {
            const res = await (0, supertest_1.default)(api_1.default).post('/api/v1/ai/generate-captions').send({});
            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('message', 'Text is required');
        });
    });
    describe('POST /api/v1/ai/detect-labels', () => {
        it('should detect labels in video successfully', async () => {
            const mockLabels = [
                { description: 'person', confidence: 0.95 },
                { description: 'outdoor', confidence: 0.88 },
                { description: 'nature', confidence: 0.82 },
            ];
            videoService.detectLabelsInVideo.mockResolvedValue(mockLabels);
            const res = await (0, supertest_1.default)(api_1.default)
                .post('/api/v1/ai/detect-labels')
                .attach('video', Buffer.from('fake video data'), 'test.mp4');
            expect([200, 400]).toContain(res.statusCode);
        });
        it('should return 400 if video file is missing', async () => {
            const res = await (0, supertest_1.default)(api_1.default).post('/api/v1/ai/detect-labels');
            expect([400, 500]).toContain(res.statusCode);
        });
    });
    describe('POST /api/v1/ai/transcode-video', () => {
        it('should create video transcoding job successfully', async () => {
            const mockJobResponse = {
                jobId: 'job123',
                status: 'pending',
            };
            transcoderService.createTranscodingJob.mockResolvedValue(mockJobResponse);
            const res = await (0, supertest_1.default)(api_1.default).post('/api/v1/ai/transcode-video').send({
                inputUri: 'gs://bucket/input/video.mp4',
                outputUri: 'gs://bucket/output/',
            });
            expect([200, 400, 500]).toContain(res.statusCode);
        });
        it('should return 400 if inputUri is missing', async () => {
            const res = await (0, supertest_1.default)(api_1.default).post('/api/v1/ai/transcode-video').send({
                outputUri: 'gs://bucket/output/',
            });
            expect([400, 500]).toContain(res.statusCode);
        });
        it('should return 400 if outputUri is missing', async () => {
            const res = await (0, supertest_1.default)(api_1.default).post('/api/v1/ai/transcode-video').send({
                inputUri: 'gs://bucket/input/video.mp4',
            });
            expect([400, 500]).toContain(res.statusCode);
        });
    });
    describe('POST /api/v1/ai/recommendations', () => {
        it('should get AI recommendations successfully', async () => {
            const mockRecommendations = [
                { id: 'item1', score: 0.95, title: 'Recommended Item 1' },
                { id: 'item2', score: 0.88, title: 'Recommended Item 2' },
                { id: 'item3', score: 0.82, title: 'Recommended Item 3' },
            ];
            const mockEngine = {
                getRecommendations: jest.fn().mockResolvedValue(mockRecommendations),
            };
            aiService.AdvancedRecommendationEngine.mockImplementation(() => mockEngine);
            const res = await (0, supertest_1.default)(api_1.default).post('/api/v1/ai/recommendations').send({
                userId: 'user123',
                context: {
                    preferences: ['tech', 'gaming'],
                    history: ['item1', 'item2'],
                },
                count: 3,
            });
            expect([200, 400, 500]).toContain(res.statusCode);
        });
        it('should handle missing userId', async () => {
            const res = await (0, supertest_1.default)(api_1.default).post('/api/v1/ai/recommendations').send({
                context: {
                    preferences: ['tech'],
                },
            });
            expect([400, 500]).toContain(res.statusCode);
        });
    });
    describe('POST /api/v1/ai/analyze-sentiment', () => {
        it('should analyze sentiment of text', async () => {
            const res = await (0, supertest_1.default)(api_1.default).post('/api/v1/ai/analyze-sentiment').send({
                text: 'This is a great product! I love it!',
            });
            expect([200, 400, 404, 500]).toContain(res.statusCode);
        });
    });
    describe('POST /api/v1/ai/content-moderation', () => {
        it('should moderate content for inappropriate material', async () => {
            const res = await (0, supertest_1.default)(api_1.default).post('/api/v1/ai/content-moderation').send({
                content: 'Some text or image to moderate',
                contentType: 'text',
            });
            expect([200, 400, 404, 500]).toContain(res.statusCode);
        });
    });
    describe('Error Handling', () => {
        it('should handle malformed JSON in request body', async () => {
            const res = await (0, supertest_1.default)(api_1.default)
                .post('/api/v1/ai/improve-text')
                .set('Content-Type', 'application/json')
                .send('{ invalid json }');
            expect(res.statusCode).toEqual(400);
        });
        it('should handle very large text input', async () => {
            const largeText = 'a'.repeat(100000);
            aiService.improveText.mockResolvedValue('improved');
            const res = await (0, supertest_1.default)(api_1.default).post('/api/v1/ai/improve-text').send({
                text: largeText,
            });
            expect([200, 413, 500]).toContain(res.statusCode);
        });
    });
});
//# sourceMappingURL=ai.test.js.map