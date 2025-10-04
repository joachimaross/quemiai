'use client';

import { useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Smile, Image as ImageIcon } from 'lucide-react';
import { getPostsWithUsers, mockUsers, getUserById } from '@/lib/mockData';
import { Post, ReactionType } from '@/lib/types';

export default function FeedPage() {
  const [posts, setPosts] = useState(getPostsWithUsers());
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const currentUser = mockUsers[0];

  const handleReaction = (postId: string, reactionType: ReactionType) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          reactions: {
            ...post.reactions,
            [reactionType]: post.reactions[reactionType] + 1,
          },
        };
      }
      return post;
    }));
  };

  const handleBookmark = (postId: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return { ...post, isBookmarked: !post.isBookmarked };
      }
      return post;
    }));
  };

  const handleCreatePost = () => {
    if (!newPostContent.trim()) return;

    const newPost: Post = {
      id: `post${Date.now()}`,
      userId: currentUser.id,
      user: currentUser,
      content: newPostContent,
      reactions: { like: 0, love: 0, laugh: 0, wow: 0, sad: 0, angry: 0 },
      commentCount: 0,
      shareCount: 0,
      isPinned: false,
      isBookmarked: false,
      createdAt: new Date(),
    };

    setPosts([newPost, ...posts]);
    setNewPostContent('');
    setShowCreatePost(false);
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };

  const renderPost = (post: Post) => {
    const totalReactions = Object.values(post.reactions).reduce((sum, count) => sum + count, 0);

    return (
      <div key={post.id} className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-4">
        {/* Post Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <img
              src={post.user?.avatar || currentUser.avatar}
              alt={post.user?.displayName || 'User'}
              className="w-12 h-12 rounded-full"
            />
            <div>
              <div className="flex items-center space-x-2">
                <p className="text-white font-semibold hover:underline cursor-pointer">
                  {post.user?.displayName || 'Unknown User'}
                </p>
                {post.user?.verified && (
                  <svg className="w-4 h-4 text-zeeky-blue" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                  </svg>
                )}
              </div>
              <p className="text-gray-400 text-sm">@{post.user?.username || 'unknown'} · {formatTimeAgo(post.createdAt)}</p>
            </div>
          </div>
          <button className="text-gray-400 hover:text-white transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Post Content */}
        <p className="text-gray-300 mb-4 whitespace-pre-wrap">{post.content}</p>

        {/* Post Media */}
        {post.media && post.media.length > 0 && (
          <div className="mb-4 rounded-lg overflow-hidden">
            {post.media[0].type === 'image' && (
              <img
                src={post.media[0].url}
                alt={post.media[0].alt || 'Post media'}
                className="w-full object-cover max-h-96 cursor-pointer hover:opacity-95 transition-opacity"
              />
            )}
          </div>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="text-zeeky-blue text-sm hover:underline cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Post Actions */}
        <div className="flex items-center justify-between border-t border-gray-700 pt-4">
          <div className="flex items-center space-x-6">
            <button
              onClick={() => handleReaction(post.id, 'like')}
              className="flex items-center space-x-2 text-gray-400 hover:text-red-500 transition-colors group"
            >
              <Heart className="w-5 h-5 group-hover:fill-current" />
              <span>{totalReactions > 0 ? totalReactions : ''}</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-400 hover:text-zeeky-blue transition-colors">
              <MessageCircle className="w-5 h-5" />
              <span>{post.commentCount > 0 ? post.commentCount : ''}</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-400 hover:text-green-500 transition-colors">
              <Share2 className="w-5 h-5" />
              <span>{post.shareCount > 0 ? post.shareCount : ''}</span>
            </button>
          </div>
          <button
            onClick={() => handleBookmark(post.id)}
            className={`transition-colors ${
              post.isBookmarked ? 'text-zeeky-blue' : 'text-gray-400 hover:text-zeeky-blue'
            }`}
          >
            <Bookmark className={`w-5 h-5 ${post.isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-deep-space pb-20">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white font-heading">Home Feed</h1>
          <p className="text-gray-400">See what your friends are sharing</p>
        </div>

        {/* Create Post Card */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <img
              src={currentUser.avatar}
              alt={currentUser.displayName}
              className="w-12 h-12 rounded-full"
            />
            <div className="flex-1">
              {showCreatePost ? (
                <div className="space-y-3">
                  <textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="What's on your mind?"
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-zeeky-blue resize-none"
                    rows={4}
                    autoFocus
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <button className="p-2 text-gray-400 hover:text-zeeky-blue hover:bg-gray-700 rounded-lg transition-colors">
                        <ImageIcon className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-zeeky-blue hover:bg-gray-700 rounded-lg transition-colors">
                        <Smile className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setShowCreatePost(false);
                          setNewPostContent('');
                        }}
                        className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleCreatePost}
                        disabled={!newPostContent.trim()}
                        className="px-6 py-2 bg-zeeky-blue hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Post
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowCreatePost(true)}
                  className="w-full text-left px-4 py-3 bg-gray-900 hover:bg-gray-700 border border-gray-700 rounded-lg text-gray-400 transition-colors"
                >
                  What's on your mind?
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Posts Feed */}
        <div>
          {posts.map(renderPost)}
        </div>

        {/* Load More */}
        <div className="text-center py-8">
          <button className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors border border-gray-700">
            Load More Posts
          </button>
        </div>
      </div>
    </div>
  );
}
