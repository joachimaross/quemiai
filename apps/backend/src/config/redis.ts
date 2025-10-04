import { createClient, RedisClientType } from 'redis';
import logger from './logger'; // Assuming you have a logger

const redisClient: RedisClientType = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
}) as RedisClientType;

redisClient.on('connect', () => logger.info('Redis client connected'));
redisClient.on('error', (err: Error) => logger.error({ err }, 'Redis client error'));

async function connectRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
}

export { redisClient, connectRedis };
