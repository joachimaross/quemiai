import { createClient } from 'redis';
import logger from './logger'; // Assuming you have a logger

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redisClient.on('connect', () => logger.info('Redis client connected'));
redisClient.on('error', (err: Error) => logger.error({ err }, 'Redis client error'));

async function connectRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
}

export { redisClient, connectRedis };
