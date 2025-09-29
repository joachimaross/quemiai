import React, { useState } from 'react';
import ChatBubble from '../../components/ChatBubble';
import MessageInput from '../../components/MessageInput';

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { message: 'Hey there!', isOwn: false, name: 'Alice', avatarUrl: '/avatar1.png' },
    { message: 'Hi! How are you?', isOwn: true, name: 'You', avatarUrl: '/avatar2.png' },
  ]);

  const handleSend = (msg: string) => {
    setMessages(prev => [...prev, { message: msg, isOwn: true, name: 'You', avatarUrl: '/avatar2.png' }]);
  };

  return (
    <main className="min-h-screen bg-bg text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold neon-gradient animate-neon-flicker mb-2">Chat</h1>
      <div className="w-full max-w-md flex flex-col flex-1 bg-gray-900 rounded-2xl shadow-lg p-4">
        <div className="flex-1 overflow-y-auto mb-2" style={{ maxHeight: 400 }}>
          {messages.map((msg, i) => (
            <ChatBubble key={i} {...msg} />
          ))}
        </div>
        <MessageInput onSend={handleSend} />
      </div>
    </main>
  );
}
