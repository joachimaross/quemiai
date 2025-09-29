import React from 'react';

interface StoryViewerProps {
  stories: { id: string; mediaUrl: string; user: string; avatarUrl: string }[];
}

export default function StoryViewer({ stories }: StoryViewerProps) {
  return (
    <div className="flex space-x-4 overflow-x-auto py-4">
      {stories.map(story => (
        <div key={story.id} className="flex flex-col items-center">
          <img src={story.avatarUrl} alt={story.user} className="w-14 h-14 rounded-full border-4 border-accent mb-1" />
          <div className="w-16 h-28 bg-secondary rounded-xl flex items-center justify-center">
            <img src={story.mediaUrl} alt="story" className="object-cover w-full h-full rounded-xl" />
          </div>
          <span className="text-xs text-white mt-1">{story.user}</span>
        </div>
      ))}
    </div>
  );
}
