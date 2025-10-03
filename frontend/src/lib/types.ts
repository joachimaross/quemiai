// Core types for Quemi Social

export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatar?: string;
  coverPhoto?: string;
  bio?: string;
  location?: string;
  website?: string;
  joinedAt: Date;
  followersCount: number;
  followingCount: number;
  isFollowing?: boolean;
  isMutualFollow?: boolean;
  isOnline?: boolean;
  lastSeen?: Date;
}

export interface Post {
  id: string;
  userId: string;
  user: User;
  content: string;
  media?: MediaItem[];
  type: 'post' | 'repost' | 'quote';
  originalPost?: Post;
  likes: number;
  comments: number;
  shares: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  isPinned?: boolean;
  tags?: string[];
  privacy: 'public' | 'friends' | 'private';
  createdAt: Date;
  updatedAt?: Date;
}

export interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  thumbnail?: string;
  caption?: string;
  duration?: number; // for video/audio
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  user: User;
  content: string;
  likes: number;
  replies: Comment[];
  isLiked?: boolean;
  parentId?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Story {
  id: string;
  userId: string;
  user: User;
  media: MediaItem;
  caption?: string;
  views: number;
  hasViewed?: boolean;
  expiresAt: Date;
  createdAt: Date;
}

export interface StoryHighlight {
  id: string;
  userId: string;
  title: string;
  coverImage: string;
  stories: Story[];
  createdAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender: User;
  content: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'emoji';
  media?: MediaItem;
  reactions?: Reaction[];
  isRead: boolean;
  isEdited?: boolean;
  replyTo?: Message;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  participants: User[];
  name?: string; // for group chats
  avatar?: string; // for group chats
  lastMessage?: Message;
  unreadCount: number;
  isPinned?: boolean;
  isMuted?: boolean;
  typingUsers?: string[]; // user IDs currently typing
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'message' | 'post';
  fromUser: User;
  post?: Post;
  comment?: Comment;
  message?: Message;
  content: string;
  isRead: boolean;
  createdAt: Date;
}

export interface Reaction {
  userId: string;
  user: User;
  emoji: string;
  createdAt: Date;
}

export interface HashTag {
  tag: string;
  postsCount: number;
  trending?: boolean;
}

export interface UserSettings {
  userId: string;
  theme: 'light' | 'dark' | 'auto';
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  messageNotifications: boolean;
  accountPrivacy: 'public' | 'private';
  showOnlineStatus: boolean;
  allowTagging: boolean;
  allowComments: boolean;
  blockedUsers: string[];
  mutedUsers: string[];
  chatBubbleColor?: string;
  fontSize?: 'small' | 'medium' | 'large';
}
