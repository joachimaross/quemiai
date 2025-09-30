import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
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
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  handleConnection(_client: Socket) {
    // Handle new connection
  }

  handleDisconnect(_client: Socket) {
    // Handle disconnect
  }

  @SubscribeMessage('sendMessage')
  handleMessage(
    @MessageBody() data: MessageData,
    @ConnectedSocket() _client: Socket,
  ) {
    // Broadcast message to conversation room
    this.server.to(data.conversationId).emit('receiveMessage', data);
  }

  @SubscribeMessage('joinConversation')
  handleJoin(@MessageBody() data: JoinData, @ConnectedSocket() client: Socket) {
    client.join(data.conversationId);
  }

  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() data: TypingData,
    @ConnectedSocket() _client: Socket,
  ) {
    // Broadcast typing indicator
    this.server.to(data.conversationId).emit('typing', data);
  }
}
