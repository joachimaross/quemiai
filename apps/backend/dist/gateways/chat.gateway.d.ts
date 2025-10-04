import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    handleConnection(_client: Socket): void;
    handleDisconnect(_client: Socket): void;
    handleMessage(data: any, _client: Socket): void;
    handleJoin(data: any, client: Socket): void;
    handleTyping(data: any, _client: Socket): void;
}
