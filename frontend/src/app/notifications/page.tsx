'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { useApp } from '@/lib/context';
import { Heart, MessageCircle, UserPlus, AtSign, FileText, Check } from 'lucide-react';

export default function NotificationsPage() {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useApp();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications =
    filter === 'unread' ? notifications.filter((n) => !n.isRead) : notifications;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-5 h-5 text-red-500" />;
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'follow':
        return <UserPlus className="w-5 h-5 text-green-500" />;
      case 'mention':
        return <AtSign className="w-5 h-5 text-purple-500" />;
      case 'message':
        return <MessageCircle className="w-5 h-5 text-zeeky-blue" />;
      case 'post':
        return <FileText className="w-5 h-5 text-yellow-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return minutes === 0 ? 'Just now' : `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    }
  };

  return (
    <div className="min-h-screen bg-deep-space pb-24">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">Notifications</h1>
          {notifications.filter((n) => !n.isRead).length > 0 && (
            <button
              onClick={markAllNotificationsAsRead}
              className="flex items-center gap-2 px-4 py-2 text-zeeky-blue hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Check className="w-4 h-4" />
              Mark all as read
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-4 border-b border-gray-700 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 font-semibold transition-colors ${
              filter === 'all'
                ? 'text-white border-b-2 border-zeeky-blue'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 font-semibold transition-colors ${
              filter === 'unread'
                ? 'text-white border-b-2 border-zeeky-blue'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Unread{' '}
            {notifications.filter((n) => !n.isRead).length > 0 && (
              <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                {notifications.filter((n) => !n.isRead).length}
              </span>
            )}
          </button>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length > 0 ? (
          <div className="space-y-2">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => {
                  if (!notification.isRead) {
                    markNotificationAsRead(notification.id);
                  }
                }}
                className={`flex gap-3 p-4 rounded-lg cursor-pointer transition-colors ${
                  notification.isRead
                    ? 'bg-gray-800 hover:bg-gray-750'
                    : 'bg-gray-800/50 border border-zeeky-blue/30 hover:bg-gray-800/70'
                }`}
              >
                {/* Icon */}
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>

                {/* User Avatar */}
                <img
                  src={notification.fromUser.avatar}
                  alt={notification.fromUser.displayName}
                  className="w-10 h-10 rounded-full flex-shrink-0"
                />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-white">
                    <span className="font-semibold">{notification.fromUser.displayName}</span>{' '}
                    <span className="text-gray-300">{notification.content}</span>
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    {formatTime(notification.createdAt)}
                  </p>

                  {/* Show preview for post/comment notifications */}
                  {notification.post && (
                    <div className="mt-2 p-2 bg-gray-900 rounded border border-gray-700">
                      <p className="text-sm text-gray-300 line-clamp-2">
                        {notification.post.content}
                      </p>
                    </div>
                  )}
                </div>

                {/* Unread Indicator */}
                {!notification.isRead && (
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-zeeky-blue rounded-full" />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
