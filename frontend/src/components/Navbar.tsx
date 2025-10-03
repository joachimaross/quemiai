'use client';

import { useRouter } from 'next/navigation';
import { Bell, Search, MessageCircle } from 'lucide-react';
import { logOut } from '@/lib/auth';
import { useApp } from '@/lib/context';

export default function Navbar() {
  const router = useRouter();
  const { currentUser, unreadNotificationsCount, unreadMessagesCount } = useApp();

  const handleLogout = async () => {
    try {
      await logOut();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="bg-gray-900 border-b border-gray-700 px-6 py-4 sticky top-0 z-50 backdrop-blur-md bg-opacity-90">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-6">
          <h1 
            className="text-2xl font-bold text-zeeky-blue font-heading cursor-pointer"
            onClick={() => router.push('/feed')}
          >
            Quemi Social
          </h1>
          
          {/* Search Bar */}
          <div className="hidden md:flex items-center bg-gray-800 rounded-lg px-4 py-2 w-64 lg:w-96">
            <Search className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent outline-none text-white placeholder-gray-400 w-full"
              onClick={() => router.push('/search')}
              readOnly
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Messages Icon */}
          <button
            onClick={() => router.push('/messages')}
            className="relative p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <MessageCircle className="w-6 h-6 text-gray-300" />
            {unreadMessagesCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
              </span>
            )}
          </button>

          {/* Notifications Icon */}
          <button
            onClick={() => router.push('/notifications')}
            className="relative p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Bell className="w-6 h-6 text-gray-300" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Profile */}
          <button
            onClick={() => router.push('/profile')}
            className="flex items-center gap-2 hover:bg-gray-800 rounded-lg p-2 transition-colors"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.displayName}
              className="w-8 h-8 rounded-full"
            />
            <span className="hidden md:inline text-white">{currentUser.displayName}</span>
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
