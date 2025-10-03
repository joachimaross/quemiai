'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { useApp } from '@/lib/context';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal } from 'lucide-react';

export default function FeedPage() {
  const { posts, stories, toggleLikePost, toggleBookmarkPost } = useApp();
  const [showCreatePost, setShowCreatePost] = useState(false);

  return (
    <div className="min-h-screen bg-deep-space pb-24">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Stories */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-4 pb-2">
            {stories.map((story) => (
              <div
                key={story.id}
                className="flex-shrink-0 cursor-pointer"
              >
                <div className={`w-16 h-16 rounded-full p-0.5 ${story.hasViewed ? 'bg-gray-600' : 'bg-gradient-to-tr from-yellow-400 to-pink-600'}`}>
                  <div className="w-full h-full rounded-full overflow-hidden border-2 border-deep-space">
                    <img
                      src={story.user.avatar}
                      alt={story.user.displayName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <p className="text-xs text-center mt-1 text-gray-300 truncate w-16">
                  {story.user.username}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Create Post Button */}
        <button
          onClick={() => setShowCreatePost(true)}
          className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg p-4 mb-6 text-left transition-colors"
        >
          <span className="text-gray-400">What's on your mind?</span>
        </button>

        {/* Posts Feed */}
        <div className="space-y-6">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden"
            >
              {/* Post Header */}
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <img
                    src={post.user.avatar}
                    alt={post.user.displayName}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <h3 className="font-semibold text-white">{post.user.displayName}</h3>
                    <p className="text-sm text-gray-400">
                      @{post.user.username} · {formatDistanceToNow(post.createdAt)}
                    </p>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-white">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>

              {/* Post Content */}
              <div className="px-4 pb-3">
                <p className="text-white whitespace-pre-wrap">{post.content}</p>
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
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

              {/* Post Media */}
              {post.media && post.media.length > 0 && (
                <div className="relative">
                  <img
                    src={post.media[0].url}
                    alt={post.media[0].caption || 'Post media'}
                    className="w-full max-h-96 object-cover"
                  />
                </div>
              )}

              {/* Post Actions */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-700">
                <button
                  onClick={() => toggleLikePost(post.id)}
                  className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Heart
                    className={`w-5 h-5 ${post.isLiked ? 'fill-red-500 text-red-500' : ''}`}
                  />
                  <span className="text-sm">{post.likes}</span>
                </button>

                <button className="flex items-center gap-2 text-gray-400 hover:text-blue-500 transition-colors">
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm">{post.comments}</span>
                </button>

                <button className="flex items-center gap-2 text-gray-400 hover:text-green-500 transition-colors">
                  <Share2 className="w-5 h-5" />
                  <span className="text-sm">{post.shares}</span>
                </button>

                <button
                  onClick={() => toggleBookmarkPost(post.id)}
                  className="flex items-center gap-2 text-gray-400 hover:text-yellow-500 transition-colors"
                >
                  <Bookmark
                    className={`w-5 h-5 ${post.isBookmarked ? 'fill-yellow-500 text-yellow-500' : ''}`}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center py-8">
          <button className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors">
            Load More Posts
          </button>
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <CreatePostModal onClose={() => setShowCreatePost(false)} />
      )}
    </div>
  );
}

function CreatePostModal({ onClose }: { onClose: () => void }) {
  const { createPost, currentUser } = useApp();
  const [content, setContent] = useState('');
  const [privacy, setPrivacy] = useState<'public' | 'friends' | 'private'>('public');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      createPost(content, [], [], privacy);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-lg">
        <h3 className="text-2xl font-bold text-white mb-4">Create Post</h3>

        <div className="flex items-center gap-3 mb-4">
          <img
            src={currentUser.avatar}
            alt={currentUser.displayName}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <h4 className="font-semibold text-white">{currentUser.displayName}</h4>
            <select
              value={privacy}
              onChange={(e) => setPrivacy(e.target.value as any)}
              className="text-sm text-gray-400 bg-gray-900 border border-gray-700 rounded px-2 py-1"
            >
              <option value="public">Public</option>
              <option value="friends">Friends</option>
              <option value="private">Private</option>
            </select>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full h-32 bg-gray-900 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-400 resize-none focus:outline-none focus:border-zeeky-blue"
            autoFocus
          />

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!content.trim()}
              className="px-4 py-2 bg-zeeky-blue hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Helper function for time formatting
function formatDistanceToNow(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + 'y';

  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + 'mo';

  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + 'd';

  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + 'h';

  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + 'm';

  return Math.floor(seconds) + 's';
}
