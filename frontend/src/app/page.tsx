'use client';

import { NextPage } from 'next';
import Logo from '@/components/Logo';

const HomePage: NextPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <Logo />
      <h1 className="text-5xl font-bold text-zeeky-blue mt-4 mb-2 font-heading tracking-tight">
        Quemi Social
      </h1>
      <p className="text-lg text-gray-300">
        Connect, Share, and Engage - Your modern social platform
      </p>
    </div>
  );
};

export default HomePage;
