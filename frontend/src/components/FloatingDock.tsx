'use client';

import { Home, Search, PlusSquare, MessageCircle, UserCircle } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useApp } from '@/lib/context';

const FloatingDock = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { unreadMessagesCount } = useApp();

  const navItems = [
    { icon: Home, label: 'Feed', path: '/feed' },
    { icon: Search, label: 'Explore', path: '/explore' },
    { icon: PlusSquare, label: 'Create', path: '/create' },
    { icon: MessageCircle, label: 'Messages', path: '/messages', badge: unreadMessagesCount },
    { icon: UserCircle, label: 'Profile', path: '/profile' },
  ];

  // Hide on certain pages
  if (pathname === '/' || pathname === '/login' || pathname === '/signup') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-auto bg-gray-900/90 backdrop-blur-md rounded-full flex items-center justify-center p-2 space-x-2 border border-gray-700/50 shadow-lg">
      {navItems.map((item) => (
        <button
          key={item.label}
          onClick={() => router.push(item.path)}
          className={cn(
            'relative flex flex-col items-center justify-center w-14 h-14 rounded-full transition-all duration-300 ease-in-out group',
            {
              'text-white bg-zeeky-blue/30': pathname === item.path,
              'text-gray-400 hover:bg-zeeky-blue/20 hover:text-white': pathname !== item.path,
            },
          )}
        >
          <item.icon className="w-6 h-6" />
          {item.badge && item.badge > 0 && (
            <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
              {item.badge > 9 ? '9+' : item.badge}
            </span>
          )}
          <span className="absolute -top-10 text-xs bg-gray-800 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );
};

export default FloatingDock;
