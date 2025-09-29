import React from 'react';
import StoryViewer from '../../components/StoryViewer';

export default function StoriesPage() {
  const stories = [
    { id: '1', mediaUrl: '/story1.jpg', user: 'Alice', avatarUrl: '/avatar1.png' },
    { id: '2', mediaUrl: '/story2.jpg', user: 'Bob', avatarUrl: '/avatar2.png' },
    { id: '3', mediaUrl: '/story3.jpg', user: 'You', avatarUrl: '/avatar3.png' },
  ];
  return (
    <main className="min-h-screen bg-bg text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold neon-gradient animate-neon-flicker mb-2">Stories</h1>
      <StoryViewer stories={stories} />
    </main>
  );
}
