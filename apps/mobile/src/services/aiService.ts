import { ApiClient, AIChatRequest, AIChatResponse, AICaptionRequest } from '@quemiai/shared';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';

class AiService {
  private client: ApiClient;

  constructor() {
    this.client = new ApiClient(API_URL);
  }

  async chat(request: AIChatRequest): Promise<AIChatResponse> {
    try {
      return await this.client.post<AIChatResponse>('/ai/chat', request);
    } catch (error) {
      console.error('Error in AI chat:', error);
      throw error;
    }
  }

  async generateCaption(request: AICaptionRequest): Promise<{ caption: string; hashtags?: string[] }> {
    try {
      return await this.client.post('/ai/caption', request);
    } catch (error) {
      console.error('Error generating caption:', error);
      throw error;
    }
  }
}

export const aiService = new AiService();
