import React from 'react';

export default function DiscoverPage() {
  const hashtags = ['#nextjs', '#cyberpunk', '#ai', '#music', '#gaming'];
  const people = [
    { name: 'Alice', avatarUrl: '/avatar1.png' },
    { name: 'Bob', avatarUrl: '/avatar2.png' },
    { name: 'Charlie', avatarUrl: '/avatar4.png' },
  ];
  return (
    <main className="min-h-screen bg-bg text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold neon-gradient animate-neon-flicker mb-2">Discover</h1>
      <div className="w-full max-w-md">
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2 text-accent">Trending Hashtags</h2>
          <div className="flex flex-wrap gap-2">
            {hashtags.map(tag => (
              <span key={tag} className="bg-secondary text-white px-3 py-1 rounded-full text-sm font-semibold">{tag}</span>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-xl font-bold mb-2 text-accent">People to Follow</h2>
          <div className="flex gap-4">
            {people.map(person => (
              <div key={person.name} className="flex flex-col items-center">
                <img src={person.avatarUrl} alt={person.name} className="w-14 h-14 rounded-full border-2 border-primary mb-1" />
                <span className="text-white text-sm font-semibold">{person.name}</span>
                <button className="mt-1 px-3 py-1 bg-primary text-black rounded-full text-xs font-bold hover:bg-accent transition">Follow</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
