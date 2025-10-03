// User-related types
export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatar?: string;
  coverPhoto?: string;
  bio?: string;
  location?: string;
  website?: string;
  followers: number;
  following: number;
  verified: boolean;
  createdAt: Date;
}

// Post-related types
export interface Post {
  id: string;
  userId: string;
  user?: User;
  content: string;
  media?: PostMedia[];
  tags?: string[];
  mentions?: string[];
  reactions: PostReactions;
  commentCount: number;
  shareCount: number;
  isPinned: boolean;
  isBookmarked: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface PostMedia {
  id: string;
  type: 'image' | 'video' | 'gif';
  url: string;
  thumbnail?: string;
  alt?: string;
}

export interface PostReactions {
  like: number;
  love: number;
  laugh: number;
  wow: number;
  sad: number;
  angry: number;
}

export type ReactionType = keyof PostReactions;

// Comment-related types
export interface Comment {
  id: string;
  postId: string;
  userId: string;
  user?: User;
  content: string;
  reactions: PostReactions;
  parentId?: string;
  replies?: Comment[];
  createdAt: Date;
  updatedAt?: Date;
}

// Message-related types
export interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: Message;
  lastMessageTimestamp?: Date;
  isGroupChat: boolean;
  groupName?: string;
  groupAvatar?: string;
  unreadCount: number;
  createdAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender?: User;
  content: string;
  media?: PostMedia[];
  reactions?: { [userId: string]: ReactionType };
  readBy: string[];
  replyTo?: Message;
  createdAt: Date;
  updatedAt?: Date;
}

// Notification-related types
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  actorId: string;
  actor?: User;
  targetId?: string;
  targetType?: 'post' | 'comment' | 'message';
  content: string;
  read: boolean;
  createdAt: Date;
}

export type NotificationType = 
  | 'like'
  | 'comment'
  | 'mention'
  | 'follow'
  | 'message'
  | 'reply'
  | 'share';

// Story-related types
export interface Story {
  id: string;
  userId: string;
  user?: User;
  media: PostMedia;
  caption?: string;
  views: number;
  viewedBy: string[];
  isHighlight: boolean;
  highlightName?: string;
  expiresAt: Date;
  createdAt: Date;
}

// Search-related types
export interface SearchFilters {
  query: string;
  type?: 'users' | 'posts' | 'hashtags' | 'all';
  sortBy?: 'recent' | 'popular' | 'relevant';
  dateRange?: 'today' | 'week' | 'month' | 'all';
}

export interface SearchResult {
  users: User[];
  posts: Post[];
  hashtags: { tag: string; count: number }[];
}
