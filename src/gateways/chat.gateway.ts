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

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleConnection(_client: Socket) {
    // Handle new connection
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleDisconnect(_client: Socket) {
    // Handle disconnect
  }

  @SubscribeMessage('sendMessage')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  handleMessage(@MessageBody() data: any, @ConnectedSocket() _client: Socket) {
    // Broadcast message to conversation room
    this.server.to(data.conversationId).emit('receiveMessage', data);
  }

  @SubscribeMessage('joinConversation')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleJoin(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    client.join(data.conversationId);
  }

  @SubscribeMessage('typing')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  handleTyping(@MessageBody() data: any, @ConnectedSocket() _client: Socket) {
    // Broadcast typing indicator
    this.server.to(data.conversationId).emit('typing', data);
  }
}
