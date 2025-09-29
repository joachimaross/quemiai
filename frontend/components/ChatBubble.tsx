import React from 'react';
import { motion } from 'framer-motion';

interface ChatBubbleProps {
  message: string;
  isOwn?: boolean;
  avatarUrl?: string;
  name?: string;
}

export default function ChatBubble({ message, isOwn, avatarUrl, name }: ChatBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-end mb-2 ${isOwn ? 'justify-end' : 'justify-start'}`}
    >
      {!isOwn && avatarUrl && (
        <img src={avatarUrl} alt={name} className="w-8 h-8 rounded-full mr-2 border-2 border-accent" />
      )}
      <div className={`max-w-xs px-4 py-2 rounded-2xl shadow-lg text-sm font-medium ${isOwn ? 'bg-primary text-black ml-2' : 'bg-secondary text-white mr-2'} neon-gradient animate-neon-flicker`}>
        {message}
      </div>
      {isOwn && avatarUrl && (
        <img src={avatarUrl} alt={name} className="w-8 h-8 rounded-full ml-2 border-2 border-primary" />
      )}
    </motion.div>
  );
}
