import { Injectable } from '@nestjs/common';
import axios from 'axios';

export interface AIChatRequest {
  message: string;
  context?: string;
  conversationId?: string;
}

export interface AIChatResponse {
  response: string;
  conversationId: string;
  timestamp: string;
}

export interface AICaptionRequest {
  imageUrl?: string;
  context?: string;
  platform?: 'instagram' | 'tiktok' | 'facebook' | 'x';
}

/**
 * QuemiAi Service - AI assistant with Zeeky's personality
 * Personality: Helpful, creative, friendly, and knowledgeable about social media
 * Capabilities: Content creation, captions, mood detection, productivity assistance
 */
@Injectable()
export class AiService {
  private openaiApiKey: string;
  private openaiBaseUrl = 'https://api.openai.com/v1';

  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY || '';
  }

  /**
   * Chat with QuemiAi assistant
   */
  async chat(request: AIChatRequest): Promise<AIChatResponse> {
    try {
      const conversationId = request.conversationId || this.generateConversationId();

      // TODO: Load conversation history from database
      const conversationHistory = await this.getConversationHistory(conversationId);

      const systemPrompt = this.getQuemiAiSystemPrompt();

      const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
        { role: 'user', content: request.message },
      ];

      // Call OpenAI API (or fallback to mock)
      const aiResponse = await this.callOpenAI(messages);

      // TODO: Save conversation to database
      await this.saveConversationMessage(conversationId, 'user', request.message);
      await this.saveConversationMessage(conversationId, 'assistant', aiResponse);

      return {
        response: aiResponse,
        conversationId,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error in AI chat:', error);
      return {
        response: "I'm having trouble connecting right now. Please try again later!",
        conversationId: request.conversationId || this.generateConversationId(),
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Generate social media caption
   */
  async generateCaption(request: AICaptionRequest): Promise<{ caption: string; hashtags?: string[] }> {
    try {
      const prompt = this.buildCaptionPrompt(request);
      
      const messages = [
        { role: 'system', content: this.getQuemiAiSystemPrompt() },
        { role: 'user', content: prompt },
      ];

      const response = await this.callOpenAI(messages);

      // Parse caption and hashtags
      const lines = response.split('\n');
      const caption = lines[0];
      const hashtags = lines
        .slice(1)
        .join(' ')
        .match(/#\w+/g);

      return {
        caption,
        hashtags: hashtags || [],
      };
    } catch (error) {
      console.error('Error generating caption:', error);
      return {
        caption: 'Create amazing content! ✨',
        hashtags: ['#QUEMI', '#content'],
      };
    }
  }

  /**
   * QuemiAi system prompt with Zeeky's personality
   */
  private getQuemiAiSystemPrompt(): string {
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

  /**
   * Build caption generation prompt
   */
  private buildCaptionPrompt(request: AICaptionRequest): string {
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

  /**
   * Call OpenAI API or mock
   */
  private async callOpenAI(messages: any[]): Promise<string> {
    if (!this.openaiApiKey || this.openaiApiKey === '') {
      // Mock response when API key is not configured
      return this.getMockResponse(messages);
    }

    try {
      const response = await axios.post(
        `${this.openaiBaseUrl}/chat/completions`,
        {
          model: 'gpt-3.5-turbo',
          messages,
          temperature: 0.7,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API error:', error);
      return this.getMockResponse(messages);
    }
  }

  /**
   * Mock response for development/testing
   */
  private getMockResponse(messages: any[]): string {
    const userMessage = messages[messages.length - 1]?.content || '';
    
    if (userMessage.toLowerCase().includes('caption')) {
      return 'Create amazing content that inspires! ✨\n#QUEMI #SocialMedia #Content #Creative';
    }
    
    return "Hey! I'm QuemiAi, your friendly assistant. How can I help you create amazing content today? 🚀";
  }

  /**
   * Generate unique conversation ID
   */
  private generateConversationId(): string {
    return `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get conversation history (mock)
   */
  private async getConversationHistory(conversationId: string): Promise<any[]> {
    // TODO: Load from database
    return [];
  }

  /**
   * Save conversation message (mock)
   */
  private async saveConversationMessage(
    conversationId: string,
    role: string,
    content: string,
  ): Promise<void> {
    // TODO: Save to database
    console.log(`Saving message to ${conversationId}: ${role} - ${content.substring(0, 50)}...`);
  }
}
