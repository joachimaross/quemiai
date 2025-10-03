'use client';

import { useState } from 'react';
import { Search, TrendingUp, Users, Hash } from 'lucide-react';
import { getPostsWithUsers, mockUsers } from '@/lib/mockData';
import { User, Post } from '@/lib/types';

const DiscoverPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'trending' | 'people' | 'hashtags'>('trending');
  
  const allPosts = getPostsWithUsers();
  const suggestedUsers = mockUsers.slice(1, 4); // Get some users as suggestions
  
  // Get trending hashtags from posts
  const trendingHashtags = allPosts
    .flatMap(post => post.tags || [])
    .reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  
  const topHashtags = Object.entries(trendingHashtags)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  const filteredPosts = searchQuery
    ? allPosts.filter(post => 
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : allPosts;

  const filteredUsers = searchQuery
    ? mockUsers.filter(user =>
        user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : suggestedUsers;

  const renderPost = (post: Post) => (
    <div key={post.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors cursor-pointer">
      {post.media && post.media.length > 0 && (
        <div className="mb-3 rounded-lg overflow-hidden">
          <img
            src={post.media[0].url}
            alt={post.media[0].alt || 'Post media'}
            className="w-full h-48 object-cover"
          />
        </div>
      )}
      <div className="flex items-start space-x-3">
        <img
          src={post.user?.avatar}
          alt={post.user?.displayName}
          className="w-10 h-10 rounded-full flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold">{post.user?.displayName}</p>
          <p className="text-gray-300 text-sm line-clamp-2 mb-2">{post.content}</p>
          <div className="flex items-center space-x-4 text-gray-400 text-sm">
            <span>❤️ {Object.values(post.reactions).reduce((a, b) => a + b, 0)}</span>
            <span>💬 {post.commentCount}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUserCard = (user: User) => (
    <div key={user.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <img
            src={user.avatar}
            alt={user.displayName}
            className="w-12 h-12 rounded-full"
          />
          <div>
            <div className="flex items-center space-x-1">
              <p className="text-white font-semibold">{user.displayName}</p>
              {user.verified && (
                <svg className="w-4 h-4 text-zeeky-blue" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                </svg>
              )}
            </div>
            <p className="text-gray-400 text-sm">@{user.username}</p>
          </div>
        </div>
        <button className="px-4 py-1 bg-zeeky-blue hover:bg-blue-600 text-white rounded-lg transition-colors text-sm">
          Follow
        </button>
      </div>
      {user.bio && (
        <p className="text-gray-300 text-sm mb-3 line-clamp-2">{user.bio}</p>
      )}
      <div className="flex space-x-4 text-sm text-gray-400">
        <span><strong className="text-white">{user.followers}</strong> followers</span>
        <span><strong className="text-white">{user.following}</strong> following</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-deep-space pb-20">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header & Search */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white font-heading mb-4">Discover</h1>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts, people, hashtags..."
              className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-zeeky-blue"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 border-b border-gray-700 mb-6">
          <button
            onClick={() => setActiveTab('trending')}
            className={`flex items-center space-x-2 pb-3 px-2 border-b-2 transition-colors ${
              activeTab === 'trending'
                ? 'border-zeeky-blue text-zeeky-blue'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            <span>Trending</span>
          </button>
          <button
            onClick={() => setActiveTab('people')}
            className={`flex items-center space-x-2 pb-3 px-2 border-b-2 transition-colors ${
              activeTab === 'people'
                ? 'border-zeeky-blue text-zeeky-blue'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Users className="w-5 h-5" />
            <span>People</span>
          </button>
          <button
            onClick={() => setActiveTab('hashtags')}
            className={`flex items-center space-x-2 pb-3 px-2 border-b-2 transition-colors ${
              activeTab === 'hashtags'
                ? 'border-zeeky-blue text-zeeky-blue'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Hash className="w-5 h-5" />
            <span>Hashtags</span>
          </button>
        </div>

        {/* Content */}
        {activeTab === 'trending' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPosts.length > 0 ? (
              filteredPosts.map(renderPost)
            ) : (
              <div className="col-span-2 text-center py-12 text-gray-400">
                No posts found
              </div>
            )}
          </div>
        )}

        {activeTab === 'people' && (
          <div>
            {!searchQuery && (
              <h2 className="text-xl font-semibold text-white mb-4 font-heading">
                Suggested for you
              </h2>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredUsers.length > 0 ? (
                filteredUsers.map(renderUserCard)
              ) : (
                <div className="col-span-2 text-center py-12 text-gray-400">
                  No users found
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'hashtags' && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-4 font-heading">
              Trending Hashtags
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {topHashtags.map(([tag, count], index) => (
                <button
                  key={tag}
                  className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors text-left"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-semibold text-zeeky-blue">#{tag}</span>
                    <span className="text-xs text-gray-500">#{index + 1} trending</span>
                  </div>
                  <p className="text-gray-400 text-sm">{count} posts</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscoverPage;
