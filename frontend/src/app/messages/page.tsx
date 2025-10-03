'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { useApp } from '@/lib/context';
import { Search, MoreVertical, Send, Smile, Paperclip, Check, CheckCheck } from 'lucide-react';

export default function MessagesPage() {
  const { conversations, messages: allMessages, currentUser, sendMessage } = useApp();
  const [selectedConversation, setSelectedConversation] = useState(conversations[0]?.id || null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const currentConversation = conversations.find((c) => c.id === selectedConversation);
  const conversationMessages = allMessages.filter(
    (m) => m.conversationId === selectedConversation
  );

  const filteredConversations = conversations.filter((conv) => {
    const participantNames = conv.participants
      .map((p) => p.displayName.toLowerCase())
      .join(' ');
    return participantNames.includes(searchQuery.toLowerCase()) || 
           conv.name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim() && selectedConversation) {
      sendMessage(selectedConversation, messageInput);
      setMessageInput('');
    }
  };

  const getConversationName = (conv: typeof conversations[0]) => {
    if (conv.type === 'group') return conv.name || 'Group Chat';
    const otherUser = conv.participants.find((p) => p.id !== currentUser.id);
    return otherUser?.displayName || 'User';
  };

  const getConversationAvatar = (conv: typeof conversations[0]) => {
    if (conv.type === 'group') return conv.avatar;
    const otherUser = conv.participants.find((p) => p.id !== currentUser.id);
    return otherUser?.avatar;
  };

  return (
    <div className="min-h-screen bg-deep-space pb-24">
      <Navbar />

      <div className="max-w-7xl mx-auto h-[calc(100vh-80px)]">
        <div className="flex h-full border-t border-gray-700">
          {/* Conversations List */}
          <div className="w-full md:w-96 border-r border-gray-700 flex flex-col bg-gray-900">
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-4">Messages</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-zeeky-blue"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv.id)}
                  className={`w-full p-4 flex items-center gap-3 hover:bg-gray-800 transition-colors border-b border-gray-800 ${
                    selectedConversation === conv.id ? 'bg-gray-800' : ''
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={getConversationAvatar(conv)}
                      alt={getConversationName(conv)}
                      className="w-12 h-12 rounded-full"
                    />
                    {conv.type === 'direct' && 
                     conv.participants.find((p) => p.id !== currentUser.id)?.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900" />
                    )}
                  </div>

                  <div className="flex-1 text-left overflow-hidden">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-white truncate">
                        {getConversationName(conv)}
                      </h3>
                      {conv.lastMessage && (
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          {formatTime(conv.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-400 truncate">
                        {conv.lastMessage?.content || 'No messages yet'}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="flex-shrink-0 ml-2 bg-zeeky-blue text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col bg-deep-space hidden md:flex">
            {currentConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-700 bg-gray-900 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={getConversationAvatar(currentConversation)}
                      alt={getConversationName(currentConversation)}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <h3 className="font-semibold text-white">
                        {getConversationName(currentConversation)}
                      </h3>
                      {currentConversation.type === 'direct' && (
                        <p className="text-sm text-gray-400">
                          {currentConversation.participants.find((p) => p.id !== currentUser.id)
                            ?.isOnline
                            ? 'Active now'
                            : 'Offline'}
                        </p>
                      )}
                      {currentConversation.type === 'group' && (
                        <p className="text-sm text-gray-400">
                          {currentConversation.participants.length} members
                        </p>
                      )}
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-white">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {conversationMessages.map((message) => {
                    const isOwn = message.senderId === currentUser.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex gap-2 max-w-md ${isOwn ? 'flex-row-reverse' : ''}`}>
                          {!isOwn && (
                            <img
                              src={message.sender.avatar}
                              alt={message.sender.displayName}
                              className="w-8 h-8 rounded-full flex-shrink-0"
                            />
                          )}
                          <div>
                            {!isOwn && (
                              <p className="text-xs text-gray-400 mb-1 px-3">
                                {message.sender.displayName}
                              </p>
                            )}
                            <div
                              className={`px-4 py-2 rounded-2xl ${
                                isOwn
                                  ? 'bg-zeeky-blue text-white rounded-br-sm'
                                  : 'bg-gray-800 text-white rounded-bl-sm'
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                            </div>
                            <div
                              className={`flex items-center gap-1 mt-1 px-3 text-xs text-gray-400 ${
                                isOwn ? 'justify-end' : ''
                              }`}
                            >
                              <span>{formatTime(message.createdAt)}</span>
                              {isOwn && (
                                <>
                                  {message.isRead ? (
                                    <CheckCheck className="w-3 h-3 text-blue-500" />
                                  ) : (
                                    <Check className="w-3 h-3" />
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-700 bg-gray-900">
                  <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <button
                      type="button"
                      className="text-gray-400 hover:text-white p-2"
                    >
                      <Paperclip className="w-5 h-5" />
                    </button>
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-zeeky-blue"
                    />
                    <button
                      type="button"
                      className="text-gray-400 hover:text-white p-2"
                    >
                      <Smile className="w-5 h-5" />
                    </button>
                    <button
                      type="submit"
                      disabled={!messageInput.trim()}
                      className="bg-zeeky-blue hover:bg-blue-600 text-white p-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-gray-400">
                    Choose from your existing conversations or start a new one
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatTime(date: Date) {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));

  if (hours < 24) {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  } else if (hours < 48) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}
