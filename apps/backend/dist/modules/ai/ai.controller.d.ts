import { AiService, AIChatRequest, AICaptionRequest } from './ai.service';
export declare class AiController {
    private readonly aiService;
    constructor(aiService: AiService);
    chat(request: AIChatRequest): Promise<import("./ai.service").AIChatResponse>;
    generateCaption(request: AICaptionRequest): Promise<{
        caption: string;
        hashtags?: string[];
    }>;
}
