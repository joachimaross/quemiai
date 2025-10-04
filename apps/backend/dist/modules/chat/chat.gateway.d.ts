import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    afterInit(_server: Server): void;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleMessage(data: {
        conversationId: string;
        message: string;
        userId: string;
    }, _client: Socket): void;
    handleJoin(data: {
        conversationId: string;
    }, client: Socket): void;
    handleTyping(data: {
        conversationId: string;
        userId: string;
        isTyping: boolean;
    }, _client: Socket): void;
}
