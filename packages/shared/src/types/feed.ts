export type Platform = 'instagram' | 'tiktok' | 'facebook' | 'x';

export interface FeedItem {
  id: string;
  content: string;
  platform: Platform;
  user: string;
  media?: string[];
  timestamp: string;
  likes?: number;
  comments?: number;
  shares?: number;
  externalId?: string;
  externalUrl?: string;
}

export interface UnifiedFeedResponse {
  items: FeedItem[];
  nextCursor?: string;
  hasMore: boolean;
}
