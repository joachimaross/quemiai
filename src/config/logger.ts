import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty', // For development readability
    options: {
      colorize: true,
    },
  },
  // Add more fields for structured logging
  base: {
    pid: process.pid,
    environment: process.env.NODE_ENV,
  },
  timestamp: () => `,"time":"${new Date().toISOString()}"`,
});

export default logger;
