export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content?: string;
  mediaUrl?: string;
  type: 'text' | 'image' | 'video' | 'audio';
  createdAt: Date;
  platform?: string;
  externalId?: string;
}

export interface Conversation {
  id: string;
  name?: string;
  isGroup: boolean;
  lastMessage?: Message;
  unreadCount: number;
  platform?: string;
  externalId?: string;
}

export interface UnifiedInboxResponse {
  conversations: Conversation[];
  nextCursor?: string;
  hasMore: boolean;
}
