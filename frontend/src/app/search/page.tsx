'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { useApp } from '@/lib/context';
import { Search as SearchIcon, Users, FileText, Hash, MessageCircle } from 'lucide-react';

export default function SearchPage() {
  const { users, posts, currentUser, followUser } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'users' | 'posts' | 'tags'>('all');

  // Search logic
  const searchUsers = users.filter(
    (user) =>
      user.id !== currentUser.id &&
      (user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const searchPosts = posts.filter((post) =>
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const allTags = posts
    .flatMap((p) => p.tags || [])
    .filter((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
  const uniqueTags = Array.from(new Set(allTags));

  const hasResults = searchUsers.length > 0 || searchPosts.length > 0 || uniqueTags.length > 0;

  return (
    <div className="min-h-screen bg-deep-space pb-24">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for users, posts, or hashtags..."
              className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-zeeky-blue"
              autoFocus
            />
          </div>
        </div>

        {searchQuery.trim() && (
          <>
            {/* Tabs */}
            <div className="flex gap-4 border-b border-gray-700 mb-6 overflow-x-auto">
              <TabButton
                active={activeTab === 'all'}
                onClick={() => setActiveTab('all')}
                icon={SearchIcon}
                label="All"
              />
              <TabButton
                active={activeTab === 'users'}
                onClick={() => setActiveTab('users')}
                icon={Users}
                label="Users"
                count={searchUsers.length}
              />
              <TabButton
                active={activeTab === 'posts'}
                onClick={() => setActiveTab('posts')}
                icon={FileText}
                label="Posts"
                count={searchPosts.length}
              />
              <TabButton
                active={activeTab === 'tags'}
                onClick={() => setActiveTab('tags')}
                icon={Hash}
                label="Tags"
                count={uniqueTags.length}
              />
            </div>

            {/* Results */}
            {hasResults ? (
              <div className="space-y-6">
                {/* Users */}
                {(activeTab === 'all' || activeTab === 'users') && searchUsers.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-white mb-4">Users</h2>
                    <div className="space-y-3">
                      {searchUsers.slice(0, activeTab === 'all' ? 3 : undefined).map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between p-4 bg-gray-800 border border-gray-700 rounded-lg hover:border-zeeky-blue transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={user.avatar}
                              alt={user.displayName}
                              className="w-12 h-12 rounded-full"
                            />
                            <div>
                              <h3 className="font-semibold text-white">{user.displayName}</h3>
                              <p className="text-sm text-gray-400">@{user.username}</p>
                              {user.bio && (
                                <p className="text-sm text-gray-300 mt-1 line-clamp-1">
                                  {user.bio}
                                </p>
                              )}
                            </div>
                          </div>
                          {!user.isFollowing && (
                            <button
                              onClick={() => followUser(user.id)}
                              className="px-4 py-2 bg-zeeky-blue hover:bg-blue-600 text-white rounded-lg transition-colors"
                            >
                              Follow
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Posts */}
                {(activeTab === 'all' || activeTab === 'posts') && searchPosts.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-white mb-4">Posts</h2>
                    <div className="space-y-3">
                      {searchPosts.slice(0, activeTab === 'all' ? 3 : undefined).map((post) => (
                        <div
                          key={post.id}
                          className="p-4 bg-gray-800 border border-gray-700 rounded-lg hover:border-zeeky-blue transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <img
                              src={post.user.avatar}
                              alt={post.user.displayName}
                              className="w-10 h-10 rounded-full"
                            />
                            <div>
                              <h3 className="font-semibold text-white">
                                {post.user.displayName}
                              </h3>
                              <p className="text-sm text-gray-400">@{post.user.username}</p>
                            </div>
                          </div>
                          <p className="text-white mb-2">{post.content}</p>
                          {post.media && post.media.length > 0 && (
                            <img
                              src={post.media[0].url}
                              alt="Post media"
                              className="w-full max-h-64 object-cover rounded-lg mt-2"
                            />
                          )}
                          <div className="flex gap-4 mt-3 text-gray-400 text-sm">
                            <span>{post.likes} likes</span>
                            <span>{post.comments} comments</span>
                            <span>{post.shares} shares</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {(activeTab === 'all' || activeTab === 'tags') && uniqueTags.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-white mb-4">Hashtags</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {uniqueTags.slice(0, activeTab === 'all' ? 6 : undefined).map((tag) => {
                        const tagCount = posts.filter((p) => p.tags?.includes(tag)).length;
                        return (
                          <div
                            key={tag}
                            className="p-4 bg-gray-800 border border-gray-700 rounded-lg hover:border-zeeky-blue transition-colors cursor-pointer"
                          >
                            <p className="text-zeeky-blue font-semibold">#{tag}</p>
                            <p className="text-sm text-gray-400 mt-1">{tagCount} posts</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
                <p className="text-gray-400">
                  Try searching for something else or check your spelling
                </p>
              </div>
            )}
          </>
        )}

        {!searchQuery.trim() && (
          <div className="text-center py-12">
            <SearchIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Search Quemi Social</h3>
            <p className="text-gray-400">
              Find users, posts, and hashtags across the platform
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  icon: any;
  label: string;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 font-semibold whitespace-nowrap transition-colors ${
        active
          ? 'text-white border-b-2 border-zeeky-blue'
          : 'text-gray-400 hover:text-white'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
      {count !== undefined && count > 0 && (
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${
            active ? 'bg-zeeky-blue text-white' : 'bg-gray-700 text-gray-300'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}
