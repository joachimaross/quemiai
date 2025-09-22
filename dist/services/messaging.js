"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const config_1 = require("../config");
const wss = new ws_1.WebSocketServer({ noServer: true });
const rooms = new Map();
wss.on('connection', (ws, request) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.log('Client connected');
    // Extract token from query parameter or header
    const token = (_a = request.url) === null || _a === void 0 ? void 0 : _a.split('token=')[1];
    if (token) {
        try {
            const decodedToken = yield config_1.auth.verifyIdToken(token);
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
}));
exports.default = wss;
