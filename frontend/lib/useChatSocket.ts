import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export function useChatSocket(conversationId: string, onMessage: (msg: any) => void) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001', {
      transports: ['websocket'],
    });
    socketRef.current = socket;

    socket.emit('joinConversation', { conversationId });
    socket.on('receiveMessage', onMessage);

    return () => {
      socket.off('receiveMessage', onMessage);
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  const sendMessage = (message: string, userId: string) => {
    socketRef.current?.emit('sendMessage', { conversationId, message, userId });
  };

  return { sendMessage };
}
