'use client';

import { NextPage } from 'next';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';

const HomePage: NextPage = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <Logo />
      <h1 className="text-5xl font-bold text-zeeky-blue mt-4 mb-2 font-heading tracking-tight">
        Quemi Social
      </h1>
      <p className="text-lg text-gray-300 mb-8">
        Connect, Share, Inspire - Your modern social experience
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => router.push('/login')}
          className="px-6 py-3 bg-zeeky-blue hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
        >
          Log In
        </button>
        <button
          onClick={() => router.push('/signup')}
          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
};

export default HomePage;
