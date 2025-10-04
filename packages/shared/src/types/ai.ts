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
  platform?: string;
}

export interface AICaptionResponse {
  caption: string;
  hashtags?: string[];
  alternatives?: string[];
}

export interface QuemiAiPersonality {
  name: 'QuemiAi';
  traits: string[];
  capabilities: string[];
}
