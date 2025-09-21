import { WebSocketServer, WebSocket } from 'ws';
import { auth } from '../config';

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
}

const wss = new WebSocketServer({ noServer: true });
const rooms = new Map<AuthenticatedWebSocket, string>();

wss.on('connection', async (ws: AuthenticatedWebSocket, request) => {
  console.log('Client connected');

  // Extract token from query parameter or header
  const token = request.url?.split('token=')[1];

  if (token) {
    try {
      const decodedToken = await auth.verifyIdToken(token);
      ws.userId = decodedToken.uid;
      console.log(`Client ${ws.userId} authenticated`);
    } catch (error) {
      console.error('WebSocket authentication failed:', error);
      ws.close(1008, 'Authentication failed');
      return;
    }
  }

  ws.on('message', message => {
    const data = JSON.parse(message.toString());

    if (data.type === 'join') {
      rooms.set(ws, data.room);
      console.log(`Client ${ws.userId || 'unauthenticated'} joined room ${data.room}`);
    } else if (data.type === 'message') {
      const room = rooms.get(ws);
      if (room) {
        wss.clients.forEach(client => {
          const authenticatedClient = client as AuthenticatedWebSocket;
          if (authenticatedClient !== ws && authenticatedClient.readyState === WebSocket.OPEN && rooms.get(authenticatedClient) === room) {
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

export default wss;
