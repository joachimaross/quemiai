import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

interface MessageData {
  conversationId: string;
  message: string;
  userId: string;
}

interface JoinData {
  conversationId: string;
}

interface TypingData {
  conversationId: string;
  userId: string;
  isTyping: boolean;
}

@WebSocketGateway({ cors: true })
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  afterInit(_server: Server) {
    console.log('WebSocket server initialized');
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('sendMessage')
  handleMessage(
    @MessageBody()
    data: MessageData,
    @ConnectedSocket() _client: Socket,
  ) {
    // Broadcast to all clients in the conversation room
    this.server.to(data.conversationId).emit('receiveMessage', data);
  }

  @SubscribeMessage('joinConversation')
  handleJoin(@MessageBody() data: JoinData, @ConnectedSocket() client: Socket) {
    client.join(data.conversationId);
    client.emit('joinedConversation', { conversationId: data.conversationId });
  }
  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody()
    data: TypingData,
    @ConnectedSocket() _client: Socket,
  ) {
    // Broadcast typing indicator to all clients in the conversation room
    this.server.to(data.conversationId).emit('typing', data);
  }
}
