'use strict';
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.connectRedis = exports.redisClient = void 0;
const redis_1 = require('redis');
const logger_1 = __importDefault(require('./logger')); // Assuming you have a logger
const redisClient = (0, redis_1.createClient)({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});
exports.redisClient = redisClient;
redisClient.on('connect', () => logger_1.default.info('Redis client connected'));
redisClient.on('error', (err) => logger_1.default.error('Redis client error', err));
function connectRedis() {
  return __awaiter(this, void 0, void 0, function* () {
    if (!redisClient.isOpen) {
      yield redisClient.connect();
    }
  });
}
exports.connectRedis = connectRedis;
