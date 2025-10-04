import { RedisClientType } from 'redis';
declare const redisClient: RedisClientType;
declare function connectRedis(): Promise<void>;
export { redisClient, connectRedis };
