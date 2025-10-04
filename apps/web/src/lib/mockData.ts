import { 
  User, 
  Post, 
  Comment, 
  Conversation, 
  Message, 
  Notification, 
  Story,
  PostReactions 
} from './types';

// Helper function to create default reactions
const createDefaultReactions = (): PostReactions => ({
  like: 0,
  love: 0,
  laugh: 0,
  wow: 0,
  sad: 0,
  angry: 0,
});

// Mock Users
export const mockUsers: User[] = [
  {
    id: 'user1',
    username: 'johndoe',
    email: 'john@example.com',
    displayName: 'John Doe',
    avatar: 'https://i.pravatar.cc/150?img=1',
    coverPhoto: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200',
    bio: 'Software engineer | Coffee enthusiast | Nature lover',
    location: 'San Francisco, CA',
    website: 'https://johndoe.com',
    followers: 1234,
    following: 567,
    verified: true,
    createdAt: new Date('2023-01-15'),
  },
  {
    id: 'user2',
    username: 'janesmit',
    email: 'jane@example.com',
    displayName: 'Jane Smith',
    avatar: 'https://i.pravatar.cc/150?img=2',
    coverPhoto: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200',
    bio: 'Designer | Photographer | Travel enthusiast',
    location: 'New York, NY',
    followers: 2345,
    following: 890,
    verified: true,
    createdAt: new Date('2023-02-10'),
  },
  {
    id: 'user3',
    username: 'mikejohnson',
    email: 'mike@example.com',
    displayName: 'Mike Johnson',
    avatar: 'https://i.pravatar.cc/150?img=3',
    bio: 'Product Manager | Tech enthusiast',
    location: 'Austin, TX',
    followers: 890,
    following: 234,
    verified: false,
    createdAt: new Date('2023-03-20'),
  },
  {
    id: 'user4',
    username: 'sarahwilliams',
    email: 'sarah@example.com',
    displayName: 'Sarah Williams',
    avatar: 'https://i.pravatar.cc/150?img=4',
    coverPhoto: 'https://images.unsplash.com/photo-1557683311-eac922347aa1?w=1200',
    bio: 'Marketing specialist | Content creator',
    location: 'Los Angeles, CA',
    followers: 3456,
    following: 1234,
    verified: true,
    createdAt: new Date('2023-04-05'),
  },
];

// Mock Posts
export const mockPosts: Post[] = [
  {
    id: 'post1',
    userId: 'user1',
    content: 'Just finished working on an amazing project! Excited to share it with you all soon. 🚀',
    tags: ['coding', 'project', 'excited'],
    reactions: { like: 45, love: 12, laugh: 2, wow: 8, sad: 0, angry: 0 },
    commentCount: 15,
    shareCount: 5,
    isPinned: true,
    isBookmarked: false,
    createdAt: new Date('2024-01-15T10:30:00'),
  },
  {
    id: 'post2',
    userId: 'user2',
    content: 'Beautiful sunset at the beach today 🌅',
    media: [
      {
        id: 'media1',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
        alt: 'Beach sunset',
      },
    ],
    tags: ['nature', 'sunset', 'beach'],
    reactions: { like: 128, love: 56, laugh: 0, wow: 23, sad: 0, angry: 0 },
    commentCount: 32,
    shareCount: 12,
    isPinned: false,
    isBookmarked: true,
    createdAt: new Date('2024-01-14T18:45:00'),
  },
  {
    id: 'post3',
    userId: 'user3',
    content: 'Thoughts on the latest tech trends? Would love to hear your opinions! 💭',
    reactions: { like: 23, love: 5, laugh: 1, wow: 3, sad: 0, angry: 0 },
    commentCount: 48,
    shareCount: 8,
    isPinned: false,
    isBookmarked: false,
    createdAt: new Date('2024-01-14T14:20:00'),
  },
  {
    id: 'post4',
    userId: 'user4',
    content: 'New blog post is live! Check out my latest insights on digital marketing strategies.',
    media: [
      {
        id: 'media2',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
        alt: 'Marketing dashboard',
      },
    ],
    tags: ['marketing', 'blog', 'digital'],
    mentions: ['user1'],
    reactions: { like: 67, love: 15, laugh: 0, wow: 9, sad: 0, angry: 0 },
    commentCount: 21,
    shareCount: 18,
    isPinned: false,
    isBookmarked: false,
    createdAt: new Date('2024-01-13T09:15:00'),
  },
];

// Mock Comments
export const mockComments: Comment[] = [
  {
    id: 'comment1',
    postId: 'post1',
    userId: 'user2',
    content: 'This looks amazing! Can\'t wait to see what you\'ve built!',
    reactions: { like: 8, love: 2, laugh: 0, wow: 1, sad: 0, angry: 0 },
    createdAt: new Date('2024-01-15T11:00:00'),
  },
  {
    id: 'comment2',
    postId: 'post1',
    userId: 'user3',
    content: 'Great work! Keep us posted 👍',
    reactions: { like: 5, love: 1, laugh: 0, wow: 0, sad: 0, angry: 0 },
    createdAt: new Date('2024-01-15T11:15:00'),
  },
  {
    id: 'comment3',
    postId: 'post2',
    userId: 'user1',
    content: 'Stunning photo! Where was this taken?',
    reactions: { like: 12, love: 3, laugh: 0, wow: 2, sad: 0, angry: 0 },
    createdAt: new Date('2024-01-14T19:00:00'),
  },
];

// Mock Conversations
export const mockConversations: Conversation[] = [
  {
    id: 'conv1',
    participants: [mockUsers[0], mockUsers[1]],
    lastMessage: undefined,
    lastMessageTimestamp: new Date('2024-01-15T12:30:00'),
    isGroupChat: false,
    unreadCount: 2,
    createdAt: new Date('2024-01-10T08:00:00'),
  },
  {
    id: 'conv2',
    participants: [mockUsers[0], mockUsers[2], mockUsers[3]],
    lastMessage: undefined,
    lastMessageTimestamp: new Date('2024-01-14T16:45:00'),
    isGroupChat: true,
    groupName: 'Project Team',
    unreadCount: 0,
    createdAt: new Date('2024-01-08T10:00:00'),
  },
];

// Mock Messages
export const mockMessages: Message[] = [
  {
    id: 'msg1',
    conversationId: 'conv1',
    senderId: 'user2',
    content: 'Hey! How are you doing?',
    readBy: ['user2'],
    createdAt: new Date('2024-01-15T12:00:00'),
  },
  {
    id: 'msg2',
    conversationId: 'conv1',
    senderId: 'user1',
    content: 'Hi! I\'m good, thanks! How about you?',
    readBy: ['user1', 'user2'],
    createdAt: new Date('2024-01-15T12:05:00'),
  },
  {
    id: 'msg3',
    conversationId: 'conv1',
    senderId: 'user2',
    content: 'Doing great! Want to grab coffee this weekend?',
    readBy: ['user2'],
    createdAt: new Date('2024-01-15T12:30:00'),
  },
];

// Mock Notifications
export const mockNotifications: Notification[] = [
  {
    id: 'notif1',
    userId: 'user1',
    type: 'like',
    actorId: 'user2',
    targetId: 'post1',
    targetType: 'post',
    content: 'liked your post',
    read: false,
    createdAt: new Date('2024-01-15T11:30:00'),
  },
  {
    id: 'notif2',
    userId: 'user1',
    type: 'comment',
    actorId: 'user3',
    targetId: 'post1',
    targetType: 'post',
    content: 'commented on your post',
    read: false,
    createdAt: new Date('2024-01-15T11:15:00'),
  },
  {
    id: 'notif3',
    userId: 'user1',
    type: 'follow',
    actorId: 'user4',
    content: 'started following you',
    read: true,
    createdAt: new Date('2024-01-14T15:20:00'),
  },
  {
    id: 'notif4',
    userId: 'user1',
    type: 'mention',
    actorId: 'user4',
    targetId: 'post4',
    targetType: 'post',
    content: 'mentioned you in a post',
    read: true,
    createdAt: new Date('2024-01-13T09:15:00'),
  },
];

// Mock Stories
export const mockStories: Story[] = [
  {
    id: 'story1',
    userId: 'user2',
    media: {
      id: 'story-media1',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800',
      alt: 'Story image',
    },
    caption: 'Amazing day! ☀️',
    views: 156,
    viewedBy: ['user1', 'user3', 'user4'],
    isHighlight: false,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    createdAt: new Date('2024-01-15T08:00:00'),
  },
  {
    id: 'story2',
    userId: 'user4',
    media: {
      id: 'story-media2',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1682687982501-1e58ab814714?w=800',
      alt: 'Story image',
    },
    views: 98,
    viewedBy: ['user1', 'user2'],
    isHighlight: false,
    expiresAt: new Date(Date.now() + 20 * 60 * 60 * 1000), // 20 hours from now
    createdAt: new Date('2024-01-15T12:00:00'),
  },
];

// Helper function to get user by ID
export const getUserById = (userId: string): User | undefined => {
  return mockUsers.find(user => user.id === userId);
};

// Helper function to get posts with user data
export const getPostsWithUsers = (): Post[] => {
  return mockPosts.map(post => ({
    ...post,
    user: getUserById(post.userId),
  }));
};

// Helper function to get comments with user data
export const getCommentsForPost = (postId: string): Comment[] => {
  return mockComments
    .filter(comment => comment.postId === postId)
    .map(comment => ({
      ...comment,
      user: getUserById(comment.userId),
    }));
};
