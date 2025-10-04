"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
let AiService = class AiService {
    constructor() {
        this.openaiBaseUrl = 'https://api.openai.com/v1';
        this.openaiApiKey = process.env.OPENAI_API_KEY || '';
    }
    async chat(request) {
        try {
            const conversationId = request.conversationId || this.generateConversationId();
            const conversationHistory = await this.getConversationHistory(conversationId);
            const systemPrompt = this.getQuemiAiSystemPrompt();
            const messages = [
                { role: 'system', content: systemPrompt },
                ...conversationHistory,
                { role: 'user', content: request.message },
            ];
            const aiResponse = await this.callOpenAI(messages);
            await this.saveConversationMessage(conversationId, 'user', request.message);
            await this.saveConversationMessage(conversationId, 'assistant', aiResponse);
            return {
                response: aiResponse,
                conversationId,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            console.error('Error in AI chat:', error);
            return {
                response: "I'm having trouble connecting right now. Please try again later!",
                conversationId: request.conversationId || this.generateConversationId(),
                timestamp: new Date().toISOString(),
            };
        }
    }
    async generateCaption(request) {
        try {
            const prompt = this.buildCaptionPrompt(request);
            const messages = [
                { role: 'system', content: this.getQuemiAiSystemPrompt() },
                { role: 'user', content: prompt },
            ];
            const response = await this.callOpenAI(messages);
            const lines = response.split('\n');
            const caption = lines[0];
            const hashtags = lines.slice(1).join(' ').match(/#\w+/g);
            return {
                caption,
                hashtags: hashtags || [],
            };
        }
        catch (error) {
            console.error('Error generating caption:', error);
            return {
                caption: 'Create amazing content! ✨',
                hashtags: ['#QUEMI', '#content'],
            };
        }
    }
    getQuemiAiSystemPrompt() {
        return `You are QuemiAi, the friendly AI assistant for the QUEMI platform. 
You were inspired by Zeeky's personality - helpful, creative, and passionate about social media.

Your capabilities:
- Help users create engaging social media content
- Generate creative captions and hashtags
- Provide productivity tips and content strategy advice
- Assist with mood detection and emotional support
- Help with storyboard creation and content planning

Your personality:
- Friendly and approachable
- Creative and inspiring
- Knowledgeable about social media trends
- Encouraging and supportive
- Professional yet fun

Always respond in a helpful, positive manner. Use emojis occasionally but not excessively.
Keep responses concise and actionable.`;
    }
    buildCaptionPrompt(request) {
        let prompt = 'Generate an engaging social media caption';
        if (request.platform) {
            prompt += ` for ${request.platform.toUpperCase()}`;
        }
        if (request.context) {
            prompt += ` about: ${request.context}`;
        }
        prompt += '. Include relevant hashtags on separate lines.';
        return prompt;
    }
    async callOpenAI(messages) {
        if (!this.openaiApiKey || this.openaiApiKey === '') {
            return this.getMockResponse(messages);
        }
        try {
            const response = await axios_1.default.post(`${this.openaiBaseUrl}/chat/completions`, {
                model: 'gpt-3.5-turbo',
                messages,
                temperature: 0.7,
            }, {
                headers: {
                    Authorization: `Bearer ${this.openaiApiKey}`,
                    'Content-Type': 'application/json',
                },
            });
            return response.data.choices[0].message.content;
        }
        catch (error) {
            console.error('OpenAI API error:', error);
            return this.getMockResponse(messages);
        }
    }
    getMockResponse(messages) {
        const userMessage = messages[messages.length - 1]?.content || '';
        if (userMessage.toLowerCase().includes('caption')) {
            return 'Create amazing content that inspires! ✨\n#QUEMI #SocialMedia #Content #Creative';
        }
        return "Hey! I'm QuemiAi, your friendly assistant. How can I help you create amazing content today? 🚀";
    }
    generateConversationId() {
        return `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    async getConversationHistory(conversationId) {
        return [];
    }
    async saveConversationMessage(conversationId, role, content) {
        console.log(`Saving message to ${conversationId}: ${role} - ${content.substring(0, 50)}...`);
    }
};
exports.AiService = AiService;
exports.AiService = AiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], AiService);
//# sourceMappingURL=ai.service.js.map