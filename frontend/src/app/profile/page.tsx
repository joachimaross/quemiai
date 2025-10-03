'use client';

import Navbar from '@/components/Navbar';
import { useApp } from '@/lib/context';
import { MapPin, Link as LinkIcon, Calendar, Edit } from 'lucide-react';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { currentUser, posts, followUser, unfollowUser } = useApp();
  const router = useRouter();

  // Filter posts by current user
  const userPosts = posts.filter((p) => p.userId === currentUser.id);

  return (
    <div className="min-h-screen bg-deep-space pb-24">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Cover Photo */}
        <div className="relative h-48 md:h-64 bg-gray-800 rounded-lg overflow-hidden mb-4">
          {currentUser.coverPhoto && (
            <img
              src={currentUser.coverPhoto}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Profile Header */}
        <div className="relative -mt-16 md:-mt-20 mb-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="flex items-end gap-4">
              <div className="relative">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.displayName}
                  className="w-32 h-32 rounded-full border-4 border-deep-space"
                />
                <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-deep-space" />
              </div>
              <div className="mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  {currentUser.displayName}
                </h1>
                <p className="text-gray-400">@{currentUser.username}</p>
              </div>
            </div>

            <button
              onClick={() => router.push('/settings')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit Profile
            </button>
          </div>
        </div>

        {/* Profile Info */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
          {currentUser.bio && (
            <p className="text-white mb-4">{currentUser.bio}</p>
          )}

          <div className="flex flex-wrap gap-4 text-gray-400 text-sm">
            {currentUser.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{currentUser.location}</span>
              </div>
            )}
            {currentUser.website && (
              <div className="flex items-center gap-1">
                <LinkIcon className="w-4 h-4" />
                <a
                  href={currentUser.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zeeky-blue hover:underline"
                >
                  {currentUser.website}
                </a>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>Joined {new Date(currentUser.joinedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
            </div>
          </div>

          <div className="flex gap-6 mt-4 pt-4 border-t border-gray-700">
            <div>
              <span className="font-semibold text-white">{currentUser.followingCount}</span>
              <span className="text-gray-400 ml-1">Following</span>
            </div>
            <div>
              <span className="font-semibold text-white">{currentUser.followersCount}</span>
              <span className="text-gray-400 ml-1">Followers</span>
            </div>
            <div>
              <span className="font-semibold text-white">{userPosts.length}</span>
              <span className="text-gray-400 ml-1">Posts</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-gray-700 mb-6">
          <button className="px-4 py-2 text-white border-b-2 border-zeeky-blue font-semibold">
            Posts
          </button>
          <button className="px-4 py-2 text-gray-400 hover:text-white transition-colors">
            Media
          </button>
          <button className="px-4 py-2 text-gray-400 hover:text-white transition-colors">
            Likes
          </button>
        </div>

        {/* Posts Grid */}
        <div className="space-y-6">
          {userPosts.length > 0 ? (
            userPosts.map((post) => (
              <div
                key={post.id}
                className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden"
              >
                <div className="p-4">
                  <p className="text-white whitespace-pre-wrap mb-2">{post.content}</p>
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-zeeky-blue text-sm hover:underline cursor-pointer"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {post.media && post.media.length > 0 && (
                  <img
                    src={post.media[0].url}
                    alt={post.media[0].caption || 'Post media'}
                    className="w-full max-h-96 object-cover"
                  />
                )}

                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-700">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                    <span className="text-sm">{post.likes}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-sm">{post.comments}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Share2 className="w-5 h-5" />
                    <span className="text-sm">{post.shares}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400">No posts yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

