import { check } from 'k6';
import ws from 'k6/ws';
import { Rate } from 'k6/metrics';

// Custom metrics
const wsErrorRate = new Rate('ws_errors');
const wsConnectRate = new Rate('ws_connect_success');

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 10 },  // Ramp up to 10 concurrent connections
    { duration: '1m', target: 10 },   // Maintain 10 connections
    { duration: '30s', target: 25 },  // Ramp up to 25 connections
    { duration: '1m', target: 25 },   // Maintain 25 connections
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    'ws_connect_success': ['rate>0.95'], // 95% successful connections
    'ws_errors': ['rate<0.05'],          // Less than 5% errors
  },
};

const WS_URL = __ENV.WS_URL || 'ws://localhost:4000';

export default function () {
  const url = WS_URL;
  const params = { tags: { name: 'WebSocketTest' } };

  const res = ws.connect(url, params, function (socket) {
    wsConnectRate.add(true);

    socket.on('open', () => {
      console.log('WebSocket connection established');

      // Send a test message
      socket.send(JSON.stringify({
        event: 'message',
        data: { text: 'Hello from k6 load test' },
      }));

      // Set up interval to send messages
      socket.setInterval(() => {
        socket.send(JSON.stringify({
          event: 'ping',
          data: { timestamp: Date.now() },
        }));
      }, 2000);

      // Close connection after 10 seconds
      socket.setTimeout(() => {
        console.log('Closing WebSocket connection');
        socket.close();
      }, 10000);
    });

    socket.on('message', (data) => {
      console.log(`Message received: ${data}`);
      check(data, {
        'message is not empty': (d) => d && d.length > 0,
      });
    });

    socket.on('error', (e) => {
      console.log(`WebSocket error: ${e.error()}`);
      wsErrorRate.add(true);
    });

    socket.on('close', () => {
      console.log('WebSocket connection closed');
    });
  });

  if (!res) {
    wsConnectRate.add(false);
    wsErrorRate.add(true);
  }

  check(res, {
    'WebSocket connection successful': (r) => r && r.status === 101,
  });
}
