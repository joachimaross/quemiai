import React from 'react';

export default function ProfilePage() {
  const user = {
    name: 'You',
    avatarUrl: '/avatar3.png',
    bio: 'Building the next-gen social app. 🚀',
    email: 'you@email.com',
  };
  return (
    <main className="min-h-screen bg-bg text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold neon-gradient animate-neon-flicker mb-2">Profile</h1>
      <div className="bg-gray-900 rounded-2xl shadow-lg p-6 flex flex-col items-center w-full max-w-sm">
        <img src={user.avatarUrl} alt={user.name} className="w-24 h-24 rounded-full border-4 border-primary mb-4" />
        <div className="text-2xl font-bold mb-1">{user.name}</div>
        <div className="text-accent text-sm mb-2">{user.email}</div>
        <div className="text-white text-center mb-4">{user.bio}</div>
        <button className="bg-primary text-black px-4 py-2 rounded-lg font-semibold shadow hover:bg-accent transition">Edit Profile</button>
      </div>
    </main>
  );
}
