'use client';

import { useState } from 'react';
import { Heart, MessageCircle, UserPlus, AtSign, Share2, Check, Filter } from 'lucide-react';
import { mockNotifications, getUserById } from '@/lib/mockData';
import { Notification, NotificationType } from '@/lib/types';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'like':
        return <Heart className="w-5 h-5 text-red-500" />;
      case 'comment':
      case 'reply':
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'follow':
        return <UserPlus className="w-5 h-5 text-green-500" />;
      case 'mention':
        return <AtSign className="w-5 h-5 text-purple-500" />;
      case 'share':
        return <Share2 className="w-5 h-5 text-yellow-500" />;
      default:
        return <MessageCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(notifications.map(notif =>
      notif.id === notificationId ? { ...notif, read: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
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

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-deep-space pb-20">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white font-heading">Notifications</h1>
              {unreadCount > 0 && (
                <p className="text-gray-400 text-sm">{unreadCount} unread</p>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center space-x-2 px-4 py-2 text-zeeky-blue hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>Mark all as read</span>
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-4 border-b border-gray-700">
            <button
              onClick={() => setFilter('all')}
              className={`pb-3 px-2 border-b-2 transition-colors ${
                filter === 'all'
                  ? 'border-zeeky-blue text-zeeky-blue'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`pb-3 px-2 border-b-2 transition-colors ${
                filter === 'unread'
                  ? 'border-zeeky-blue text-zeeky-blue'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              Unread
              {unreadCount > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-zeeky-blue text-white text-xs rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-2">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Filter className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No notifications</p>
            </div>
          ) : (
            filteredNotifications.map(notification => {
              const actor = getUserById(notification.actorId);
              
              return (
                <div
                  key={notification.id}
                  onClick={() => markAsRead(notification.id)}
                  className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                    notification.read
                      ? 'bg-gray-800/50 border-gray-700/50 hover:bg-gray-800'
                      : 'bg-gray-800 border-gray-700 hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Actor Avatar */}
                    <img
                      src={actor?.avatar || 'https://i.pravatar.cc/150?img=10'}
                      alt={actor?.displayName || 'User'}
                      className="w-12 h-12 rounded-full flex-shrink-0"
                    />

                    {/* Notification Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-white">
                            <span className="font-semibold">{actor?.displayName || 'Someone'}</span>
                            {' '}
                            <span className="text-gray-300">{notification.content}</span>
                          </p>
                          <p className="text-gray-400 text-sm mt-1">
                            {formatTimeAgo(notification.createdAt)}
                          </p>
                        </div>

                        {/* Notification Icon & Unread Badge */}
                        <div className="flex items-center space-x-2 ml-2 flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                          {!notification.read && (
                            <div className="w-2 h-2 bg-zeeky-blue rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
