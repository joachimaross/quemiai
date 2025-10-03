import { Counter, Gauge, Histogram } from 'prom-client';
import { register } from './http.metrics';

// Active WebSocket connections gauge
export const activeWebSocketConnections = new Gauge({
  name: 'websocket_connections_active',
  help: 'Number of active WebSocket connections',
  registers: [register],
});

// WebSocket messages counter
export const websocketMessagesCounter = new Counter({
  name: 'websocket_messages_total',
  help: 'Total number of WebSocket messages',
  labelNames: ['type', 'event'],
  registers: [register],
});

// WebSocket message duration histogram
export const websocketMessageDuration = new Histogram({
  name: 'websocket_message_duration_seconds',
  help: 'Duration of WebSocket message processing in seconds',
  labelNames: ['event'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
  registers: [register],
});
