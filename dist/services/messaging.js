"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const config_1 = require("../config");
const wss = new ws_1.WebSocketServer({ noServer: true });
const rooms = new Map();
wss.on('connection', async (ws, request) => {
    console.log('Client connected');
    // Extract token from query parameter or header
    const token = request.url?.split('token=')[1];
    if (token) {
        try {
            const decodedToken = await config_1.auth.verifyIdToken(token);
            ws.userId = decodedToken.uid;
            console.log(`Client ${ws.userId} authenticated`);
        }
        catch (error) {
            console.error('WebSocket authentication failed:', error);
            ws.close(1008, 'Authentication failed');
            return;
        }
    }
    ws.on('message', (message) => {
        const data = JSON.parse(message.toString());
        if (data.type === 'join') {
            rooms.set(ws, data.room);
            console.log(`Client ${ws.userId || 'unauthenticated'} joined room ${data.room}`);
        }
        else if (data.type === 'message') {
            const room = rooms.get(ws);
            if (room) {
                wss.clients.forEach((client) => {
                    const authenticatedClient = client;
                    if (authenticatedClient !== ws &&
                        authenticatedClient.readyState === ws_1.WebSocket.OPEN &&
                        rooms.get(authenticatedClient) === room) {
                        authenticatedClient.send(JSON.stringify({ type: 'message', userId: ws.userId, message: data.message }));
                    }
                });
            }
        }
    });
    ws.on('close', () => {
        console.log(`Client ${ws.userId || 'unauthenticated'} disconnected`);
        rooms.delete(ws);
    });
});
exports.default = wss;
