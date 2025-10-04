'use client';

import { useState } from 'react';
import { Search, MoreVertical, Smile, Image as ImageIcon, Send, Check, CheckCheck } from 'lucide-react';
import { mockConversations, mockMessages, mockUsers, getUserById } from '@/lib/mockData';
import { Conversation, Message } from '@/lib/types';

export default function MessagesPage() {
  const [conversations] = useState(mockConversations);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const currentUser = mockUsers[0];

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message: Message = {
      id: `msg${Date.now()}`,
      conversationId: selectedConversation.id,
      senderId: currentUser.id,
      sender: currentUser,
      content: newMessage,
      readBy: [currentUser.id],
      createdAt: new Date(),
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  const getConversationMessages = (conversationId: string) => {
    return messages
      .filter(msg => msg.conversationId === conversationId)
      .map(msg => ({
        ...msg,
        sender: getUserById(msg.senderId),
      }));
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  };

  const formatLastMessageTime = (date?: Date) => {
    if (!date) return '';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };

  const getOtherParticipants = (conversation: Conversation) => {
    return conversation.participants.filter(p => p.id !== currentUser.id);
  };

  const getConversationName = (conversation: Conversation) => {
    if (conversation.isGroupChat && conversation.groupName) {
      return conversation.groupName;
    }
    const others = getOtherParticipants(conversation);
    return others.map(p => p.displayName).join(', ');
  };

  const getConversationAvatar = (conversation: Conversation) => {
    if (conversation.isGroupChat && conversation.groupAvatar) {
      return conversation.groupAvatar;
    }
    const others = getOtherParticipants(conversation);
    return others[0]?.avatar || '';
  };

  const filteredConversations = conversations.filter(conv => {
    const name = getConversationName(conv).toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  const conversationMessages = selectedConversation
    ? getConversationMessages(selectedConversation.id)
    : [];

  return (
    <div className="min-h-screen bg-deep-space pb-20">
      <div className="container mx-auto px-4 py-6">
        <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden" style={{ height: 'calc(100vh - 8rem)' }}>
          <div className="flex h-full">
            {/* Conversations List */}
            <div className="w-full md:w-96 border-r border-gray-700 flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-gray-700">
                <h1 className="text-2xl font-bold text-white font-heading mb-4">Messages</h1>
                
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search conversations..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-zeeky-blue"
                  />
                </div>
              </div>

              {/* Conversations */}
              <div className="flex-1 overflow-y-auto">
                {filteredConversations.map(conversation => {
                  const isSelected = selectedConversation?.id === conversation.id;
                  const lastMsg = conversation.lastMessage;

                  return (
                    <button
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation)}
                      className={`w-full p-4 flex items-start space-x-3 hover:bg-gray-700/50 transition-colors border-b border-gray-700/50 ${
                        isSelected ? 'bg-gray-700/50' : ''
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        <img
                          src={getConversationAvatar(conversation)}
                          alt={getConversationName(conversation)}
                          className="w-12 h-12 rounded-full"
                        />
                        {conversation.unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-zeeky-blue text-white text-xs rounded-full flex items-center justify-center">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 text-left min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-white font-semibold truncate">
                            {getConversationName(conversation)}
                          </p>
                          <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                            {formatLastMessageTime(conversation.lastMessageTimestamp)}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm truncate">
                          {lastMsg ? lastMsg.content : 'No messages yet'}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Chat Area */}
            {selectedConversation ? (
              <div className="flex-1 flex flex-col hidden md:flex">
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={getConversationAvatar(selectedConversation)}
                      alt={getConversationName(selectedConversation)}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="text-white font-semibold">
                        {getConversationName(selectedConversation)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {selectedConversation.isGroupChat 
                          ? `${selectedConversation.participants.length} members`
                          : 'Active now'}
                      </p>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-white transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {conversationMessages.map(message => {
                    const isOwn = message.senderId === currentUser.id;
                    const isRead = message.readBy.length > 1;

                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
                          {!isOwn && (
                            <img
                              src={message.sender?.avatar}
                              alt={message.sender?.displayName}
                              className="w-8 h-8 rounded-full flex-shrink-0"
                            />
                          )}
                          <div>
                            <div
                              className={`px-4 py-2 rounded-2xl ${
                                isOwn
                                  ? 'bg-zeeky-blue text-white rounded-br-none'
                                  : 'bg-gray-700 text-white rounded-bl-none'
                              }`}
                            >
                              <p className="break-words">{message.content}</p>
                            </div>
                            <div className={`flex items-center space-x-1 mt-1 px-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                              <span className="text-xs text-gray-500">
                                {formatTime(message.createdAt)}
                              </span>
                              {isOwn && (
                                <span className="text-gray-400">
                                  {isRead ? <CheckCheck className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-700">
                  <div className="flex items-end space-x-2">
                    <button className="p-2 text-gray-400 hover:text-zeeky-blue hover:bg-gray-700 rounded-lg transition-colors">
                      <ImageIcon className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-zeeky-blue hover:bg-gray-700 rounded-lg transition-colors">
                      <Smile className="w-5 h-5" />
                    </button>
                    <div className="flex-1 relative">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        placeholder="Type a message..."
                        className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-zeeky-blue resize-none"
                        rows={1}
                      />
                    </div>
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="p-2 bg-zeeky-blue hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 hidden md:flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <p className="text-lg mb-2">Select a conversation</p>
                  <p className="text-sm">Choose from your existing conversations or start a new one</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
