"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisClient = void 0;
exports.connectRedis = connectRedis;
const redis_1 = require("redis");
const logger_1 = __importDefault(require("./logger")); // Assuming you have a logger
const redisClient = (0, redis_1.createClient)({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
});
exports.redisClient = redisClient;
redisClient.on('connect', () => logger_1.default.info('Redis client connected'));
redisClient.on('error', (err) => logger_1.default.error('Redis client error', err));
async function connectRedis() {
    if (!redisClient.isOpen) {
        await redisClient.connect();
    }
}
