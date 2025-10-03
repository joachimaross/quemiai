'use client';

import { Home, Compass, MessageCircle, Users, UserCircle } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const FloatingDock = () => {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { icon: Home, label: 'Feed', path: '/feed' },
    { icon: Compass, label: 'Discover', path: '/discover' },
    { icon: MessageCircle, label: 'Messages', path: '/messages' },
    { icon: Users, label: 'Community', path: '/community' },
    { icon: UserCircle, label: 'Profile', path: '/profile' },
  ];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-auto bg-gray-900/50 backdrop-blur-md rounded-full flex items-center justify-center p-2 space-x-2 border border-gray-700/50">
      {navItems.map((item) => (
        <button
          key={item.label}
          onClick={() => router.push(item.path)}
          className={cn(
            'flex flex-col items-center justify-center w-16 h-16 rounded-full transition-all duration-300 ease-in-out group',
            {
              'text-white bg-zeeky-blue/20': pathname === item.path,
              'text-gray-400 hover:bg-zeeky-blue/20 hover:text-white': pathname !== item.path,
            },
          )}
        >
          <item.icon className="w-6 h-6" />
          <span className="text-xs mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );
};

export default FloatingDock;
