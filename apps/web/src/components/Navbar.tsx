'use client';

import { useRouter } from 'next/navigation';
import { logOut } from '@/lib/auth';

export default function Navbar() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logOut();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="bg-gray-900 border-b border-gray-700 px-6 py-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-zeeky-blue font-heading">Quemiai</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
