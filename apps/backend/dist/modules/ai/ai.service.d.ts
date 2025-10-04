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
export declare class AiService {
    private openaiApiKey;
    private openaiBaseUrl;
    constructor();
    chat(request: AIChatRequest): Promise<AIChatResponse>;
    generateCaption(request: AICaptionRequest): Promise<{
        caption: string;
        hashtags?: string[];
    }>;
    private getQuemiAiSystemPrompt;
    private buildCaptionPrompt;
    private callOpenAI;
    private getMockResponse;
    private generateConversationId;
    private getConversationHistory;
    private saveConversationMessage;
}
