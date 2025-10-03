'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  User,
  Post,
  Story,
  Conversation,
  Message,
  Notification,
  UserSettings,
  Comment,
} from './types';
import {
  currentUser as initialCurrentUser,
  users as initialUsers,
  posts as initialPosts,
  stories as initialStories,
  conversations as initialConversations,
  messages as initialMessages,
  notifications as initialNotifications,
  userSettings as initialUserSettings,
  comments as initialComments,
} from './placeholderData';

interface AppContextType {
  currentUser: User;
  users: User[];
  posts: Post[];
  stories: Story[];
  conversations: Conversation[];
  messages: Message[];
  notifications: Notification[];
  userSettings: UserSettings;
  comments: Comment[];
  unreadNotificationsCount: number;
  unreadMessagesCount: number;
  
  // Actions
  toggleLikePost: (postId: string) => void;
  toggleBookmarkPost: (postId: string) => void;
  addComment: (postId: string, content: string) => void;
  toggleLikeComment: (commentId: string) => void;
  followUser: (userId: string) => void;
  unfollowUser: (userId: string) => void;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  sendMessage: (conversationId: string, content: string) => void;
  markMessageAsRead: (messageId: string) => void;
  updateUserSettings: (settings: Partial<UserSettings>) => void;
  createPost: (content: string, media?: any[], tags?: string[], privacy?: 'public' | 'friends' | 'private') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(initialCurrentUser);
  const [users, setUsers] = useState(initialUsers);
  const [posts, setPosts] = useState(initialPosts);
  const [stories, setStories] = useState(initialStories);
  const [conversations, setConversations] = useState(initialConversations);
  const [messages, setMessages] = useState(initialMessages);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [userSettings, setUserSettings] = useState(initialUserSettings);
  const [comments, setComments] = useState(initialComments);

  const unreadNotificationsCount = notifications.filter((n) => !n.isRead).length;
  const unreadMessagesCount = conversations.reduce((acc, conv) => acc + conv.unreadCount, 0);

  const toggleLikePost = useCallback((postId: string) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );
  }, []);

  const toggleBookmarkPost = useCallback((postId: string) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, isBookmarked: !post.isBookmarked } : post
      )
    );
  }, []);

  const addComment = useCallback((postId: string, content: string) => {
    const newComment: Comment = {
      id: `c${Date.now()}`,
      postId,
      userId: currentUser.id,
      user: currentUser,
      content,
      likes: 0,
      replies: [],
      createdAt: new Date(),
    };
    
    setComments((prevComments) => [...prevComments, newComment]);
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, comments: post.comments + 1 } : post
      )
    );
  }, [currentUser]);

  const toggleLikeComment = useCallback((commentId: string) => {
    setComments((prevComments) =>
      prevComments.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              isLiked: !comment.isLiked,
              likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
            }
          : comment
      )
    );
  }, []);

  const followUser = useCallback((userId: string) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId
          ? { ...user, isFollowing: true, followersCount: user.followersCount + 1 }
          : user
      )
    );
    setCurrentUser((prev) => ({ ...prev, followingCount: prev.followingCount + 1 }));
  }, []);

  const unfollowUser = useCallback((userId: string) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId
          ? { ...user, isFollowing: false, followersCount: user.followersCount - 1 }
          : user
      )
    );
    setCurrentUser((prev) => ({ ...prev, followingCount: prev.followingCount - 1 }));
  }, []);

  const markNotificationAsRead = useCallback((notificationId: string) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) =>
        notification.id === notificationId ? { ...notification, isRead: true } : notification
      )
    );
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) => ({ ...notification, isRead: true }))
    );
  }, []);

  const sendMessage = useCallback((conversationId: string, content: string) => {
    const newMessage: Message = {
      id: `msg${Date.now()}`,
      conversationId,
      senderId: currentUser.id,
      sender: currentUser,
      content,
      type: 'text',
      isRead: false,
      createdAt: new Date(),
    };
    
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setConversations((prevConversations) =>
      prevConversations.map((conv) =>
        conv.id === conversationId
          ? { ...conv, lastMessage: newMessage, updatedAt: new Date() }
          : conv
      )
    );
  }, [currentUser]);

  const markMessageAsRead = useCallback((messageId: string) => {
    setMessages((prevMessages) =>
      prevMessages.map((message) =>
        message.id === messageId ? { ...message, isRead: true } : message
      )
    );
  }, []);

  const updateUserSettings = useCallback((settings: Partial<UserSettings>) => {
    setUserSettings((prev) => ({ ...prev, ...settings }));
  }, []);

  const createPost = useCallback((
    content: string,
    media?: any[],
    tags?: string[],
    privacy: 'public' | 'friends' | 'private' = 'public'
  ) => {
    const newPost: Post = {
      id: `p${Date.now()}`,
      userId: currentUser.id,
      user: currentUser,
      content,
      media,
      type: 'post',
      likes: 0,
      comments: 0,
      shares: 0,
      tags,
      privacy,
      createdAt: new Date(),
    };
    
    setPosts((prevPosts) => [newPost, ...prevPosts]);
  }, [currentUser]);

  const value = {
    currentUser,
    users,
    posts,
    stories,
    conversations,
    messages,
    notifications,
    userSettings,
    comments,
    unreadNotificationsCount,
    unreadMessagesCount,
    toggleLikePost,
    toggleBookmarkPost,
    addComment,
    toggleLikeComment,
    followUser,
    unfollowUser,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    sendMessage,
    markMessageAsRead,
    updateUserSettings,
    createPost,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
