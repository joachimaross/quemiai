'use client';

import Navbar from '@/components/Navbar';
import { useApp } from '@/lib/context';
import { TrendingUp, UserPlus, Hash } from 'lucide-react';
import { Heart, MessageCircle } from 'lucide-react';

export default function ExplorePage() {
  const { posts, users, currentUser, followUser, unfollowUser } = useApp();

  // Get trending posts (most liked)
  const trendingPosts = [...posts]
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 6);

  // Get suggested users (users not followed by current user)
  const suggestedUsers = users
    .filter((u) => u.id !== currentUser.id && !u.isFollowing)
    .slice(0, 5);

  // Get trending hashtags
  const allTags = posts
    .flatMap((p) => p.tags || [])
    .reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const trendingTags = Object.entries(allTags)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  return (
    <div className="min-h-screen bg-deep-space pb-24">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-white mb-6">Explore</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Trending Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-6 h-6 text-zeeky-blue" />
                <h2 className="text-2xl font-bold text-white">Trending Posts</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trendingPosts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden cursor-pointer hover:border-zeeky-blue transition-colors"
                  >
                    {post.media && post.media.length > 0 && (
                      <img
                        src={post.media[0].url}
                        alt="Post media"
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <img
                          src={post.user.avatar}
                          alt={post.user.displayName}
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {post.user.displayName}
                          </p>
                          <p className="text-xs text-gray-400">@{post.user.username}</p>
                        </div>
                      </div>
                      <p className="text-white text-sm line-clamp-2 mb-2">{post.content}</p>
                      <div className="flex items-center gap-4 text-gray-400 text-sm">
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          <span>{post.likes}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          <span>{post.comments}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Suggested Users */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <UserPlus className="w-5 h-5 text-zeeky-blue" />
                <h3 className="text-lg font-bold text-white">Suggested For You</h3>
              </div>

              <div className="space-y-3">
                {suggestedUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={user.avatar}
                        alt={user.displayName}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {user.displayName}
                        </p>
                        <p className="text-xs text-gray-400">@{user.username}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => followUser(user.id)}
                      className="px-3 py-1 bg-zeeky-blue hover:bg-blue-600 text-white text-sm rounded-lg transition-colors"
                    >
                      Follow
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Trending Hashtags */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <Hash className="w-5 h-5 text-zeeky-blue" />
                <h3 className="text-lg font-bold text-white">Trending Hashtags</h3>
              </div>

              <div className="space-y-2">
                {trendingTags.map(([tag, count], index) => (
                  <div
                    key={tag}
                    className="flex items-center justify-between cursor-pointer hover:bg-gray-700 p-2 rounded transition-colors"
                  >
                    <div>
                      <p className="text-zeeky-blue font-semibold">#{tag}</p>
                      <p className="text-xs text-gray-400">{count} posts</p>
                    </div>
                    <span className="text-gray-400 text-sm">#{index + 1}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-bold text-white mb-4">Categories</h3>
              <div className="space-y-2">
                {['Technology', 'Design', 'Travel', 'Food', 'Photography', 'Fitness'].map(
                  (category) => (
                    <button
                      key={category}
                      className="w-full text-left px-3 py-2 text-gray-300 hover:bg-gray-700 rounded transition-colors"
                    >
                      {category}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
