'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, MapPin, Link as LinkIcon, Calendar, Edit2, UserPlus, UserMinus, Heart, MessageCircle, Share2 } from 'lucide-react';
import { mockUsers, getPostsWithUsers } from '@/lib/mockData';
import { User, Post } from '@/lib/types';

const ProfilePage = () => {
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'media' | 'about'>('posts');

  // For demo purposes, use the first user from mockUsers
  const currentUser: User = mockUsers[0];
  
  // Get user's posts
  const allPosts = getPostsWithUsers();
  const userPosts = allPosts.filter(post => post.userId === currentUser.id);
  const userMediaPosts = userPosts.filter(post => post.media && post.media.length > 0);

  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'long' 
    }).format(date);
  };

  const renderPost = (post: Post) => (
    <div key={post.id} className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-4">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img
            src={currentUser.avatar}
            alt={currentUser.displayName}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <p className="text-white font-semibold">{currentUser.displayName}</p>
            <p className="text-gray-400 text-sm">
              {new Intl.DateTimeFormat('en-US', { 
                month: 'short', 
                day: 'numeric' 
              }).format(post.createdAt)}
            </p>
          </div>
        </div>
      </div>

      <p className="text-gray-300 mb-4">{post.content}</p>

      {post.media && post.media.length > 0 && (
        <div className="mb-4 rounded-lg overflow-hidden">
          <img
            src={post.media[0].url}
            alt={post.media[0].alt || 'Post media'}
            className="w-full object-cover max-h-96"
          />
        </div>
      )}

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

      <div className="flex items-center space-x-6 text-gray-400 border-t border-gray-700 pt-4">
        <button className="flex items-center space-x-2 hover:text-zeeky-blue transition-colors">
          <Heart className="w-5 h-5" />
          <span>{post.reactions.like + post.reactions.love}</span>
        </button>
        <button className="flex items-center space-x-2 hover:text-zeeky-blue transition-colors">
          <MessageCircle className="w-5 h-5" />
          <span>{post.commentCount}</span>
        </button>
        <button className="flex items-center space-x-2 hover:text-zeeky-blue transition-colors">
          <Share2 className="w-5 h-5" />
          <span>{post.shareCount}</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-deep-space pb-20">
      {/* Cover Photo */}
      <div className="relative h-64 md:h-80 bg-gradient-to-r from-purple-600 to-blue-600">
        {currentUser.coverPhoto && (
          <img
            src={currentUser.coverPhoto}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        )}
        <button className="absolute bottom-4 right-4 p-2 bg-gray-900/80 hover:bg-gray-900 text-white rounded-full transition-colors">
          <Camera className="w-5 h-5" />
        </button>
      </div>

      {/* Profile Info */}
      <div className="container mx-auto px-4">
        <div className="relative -mt-20 md:-mt-24 mb-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between">
            {/* Avatar */}
            <div className="relative inline-block">
              <img
                src={currentUser.avatar}
                alt={currentUser.displayName}
                className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-deep-space"
              />
              <button className="absolute bottom-2 right-2 p-2 bg-gray-900 hover:bg-gray-800 text-white rounded-full border-2 border-deep-space transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 md:mt-0 md:mb-4 flex space-x-3">
              <button
                onClick={handleFollowToggle}
                className={`flex items-center space-x-2 px-6 py-2 rounded-lg transition-colors ${
                  isFollowing
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-zeeky-blue hover:bg-blue-600 text-white'
                }`}
              >
                {isFollowing ? <UserMinus className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                <span>{isFollowing ? 'Unfollow' : 'Follow'}</span>
              </button>
              <button 
                onClick={() => router.push('/profile/edit')}
                className="flex items-center space-x-2 px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                <Edit2 className="w-5 h-5" />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>

          {/* User Info */}
          <div className="mt-6">
            <div className="flex items-center space-x-2 mb-2">
              <h1 className="text-3xl font-bold text-white font-heading">
                {currentUser.displayName}
              </h1>
              {currentUser.verified && (
                <svg className="w-6 h-6 text-zeeky-blue" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                </svg>
              )}
            </div>
            <p className="text-gray-400 mb-4">@{currentUser.username}</p>

            {currentUser.bio && (
              <p className="text-gray-300 mb-4 max-w-2xl">{currentUser.bio}</p>
            )}

            <div className="flex flex-wrap gap-4 text-gray-400 text-sm mb-4">
              {currentUser.location && (
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{currentUser.location}</span>
                </div>
              )}
              {currentUser.website && (
                <div className="flex items-center space-x-1">
                  <LinkIcon className="w-4 h-4" />
                  <a 
                    href={currentUser.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-zeeky-blue hover:underline"
                  >
                    {currentUser.website.replace('https://', '')}
                  </a>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>Joined {formatDate(currentUser.createdAt)}</span>
              </div>
            </div>

            <div className="flex space-x-6 text-sm">
              <button className="hover:underline">
                <span className="text-white font-semibold">{currentUser.following}</span>{' '}
                <span className="text-gray-400">Following</span>
              </button>
              <button className="hover:underline">
                <span className="text-white font-semibold">{currentUser.followers}</span>{' '}
                <span className="text-gray-400">Followers</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-700 mb-6">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('posts')}
              className={`pb-4 px-2 border-b-2 transition-colors ${
                activeTab === 'posts'
                  ? 'border-zeeky-blue text-zeeky-blue'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              Posts
            </button>
            <button
              onClick={() => setActiveTab('media')}
              className={`pb-4 px-2 border-b-2 transition-colors ${
                activeTab === 'media'
                  ? 'border-zeeky-blue text-zeeky-blue'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              Media
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`pb-4 px-2 border-b-2 transition-colors ${
                activeTab === 'about'
                  ? 'border-zeeky-blue text-zeeky-blue'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              About
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-3xl mx-auto">
          {activeTab === 'posts' && (
            <div>
              {userPosts.length > 0 ? (
                userPosts.map(renderPost)
              ) : (
                <div className="text-center py-12 text-gray-400">
                  No posts yet
                </div>
              )}
            </div>
          )}

          {activeTab === 'media' && (
            <div>
              {userMediaPosts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {userMediaPosts.map(post => 
                    post.media?.map(media => (
                      <div key={media.id} className="aspect-square rounded-lg overflow-hidden">
                        <img
                          src={media.url}
                          alt={media.alt || 'Media'}
                          className="w-full h-full object-cover hover:scale-110 transition-transform cursor-pointer"
                        />
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  No media yet
                </div>
              )}
            </div>
          )}

          {activeTab === 'about' && (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4 font-heading">About</h2>
              <div className="space-y-4 text-gray-300">
                {currentUser.bio && (
                  <div>
                    <h3 className="text-gray-400 text-sm font-medium mb-1">Bio</h3>
                    <p>{currentUser.bio}</p>
                  </div>
                )}
                {currentUser.location && (
                  <div>
                    <h3 className="text-gray-400 text-sm font-medium mb-1">Location</h3>
                    <p className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4" />
                      <span>{currentUser.location}</span>
                    </p>
                  </div>
                )}
                {currentUser.website && (
                  <div>
                    <h3 className="text-gray-400 text-sm font-medium mb-1">Website</h3>
                    <a 
                      href={currentUser.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-zeeky-blue hover:underline flex items-center space-x-2"
                    >
                      <LinkIcon className="w-4 h-4" />
                      <span>{currentUser.website}</span>
                    </a>
                  </div>
                )}
                <div>
                  <h3 className="text-gray-400 text-sm font-medium mb-1">Joined</h3>
                  <p className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(currentUser.createdAt)}</span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
