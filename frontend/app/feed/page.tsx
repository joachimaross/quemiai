import React, { useState } from 'react';
import PostCard from '../../components/PostCard';

export default function FeedPage() {
  const [posts] = useState([
    { user: 'Alice', avatarUrl: '/avatar1.png', content: 'Just had an amazing day! 🌞', mediaUrl: '/media1.jpg', likes: 12, comments: 3 },
    { user: 'Bob', avatarUrl: '/avatar2.png', content: 'Check out this cool photo!', mediaUrl: '/media2.jpg', likes: 8, comments: 1 },
    { user: 'You', avatarUrl: '/avatar3.png', content: 'Hello world!', likes: 5, comments: 0 },
  ]);

  return (
    <main className="min-h-screen bg-bg text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold neon-gradient animate-neon-flicker mb-2">Feed</h1>
      <div className="w-full max-w-md flex flex-col flex-1">
        {posts.map((post, i) => (
          <PostCard key={i} {...post} />
        ))}
      </div>
    </main>
  );
}
