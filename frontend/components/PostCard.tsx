import React from 'react';
import { motion } from 'framer-motion';

interface PostCardProps {
  user: string;
  avatarUrl: string;
  content: string;
  mediaUrl?: string;
  likes: number;
  comments: number;
}

export default function PostCard({ user, avatarUrl, content, mediaUrl, likes, comments }: PostCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-bg border border-accent rounded-2xl shadow-lg p-4 mb-4 w-full max-w-md mx-auto"
    >
      <div className="flex items-center mb-2">
        <img src={avatarUrl} alt={user} className="w-10 h-10 rounded-full border-2 border-primary mr-2" />
        <span className="font-bold text-primary">{user}</span>
      </div>
      <div className="mb-2 text-white">{content}</div>
      {mediaUrl && (
        <img src={mediaUrl} alt="media" className="rounded-xl w-full mb-2" />
      )}
      <div className="flex justify-between text-xs text-accent mt-2">
        <span>❤️ {likes}</span>
        <span>💬 {comments}</span>
      </div>
    </motion.div>
  );
}
