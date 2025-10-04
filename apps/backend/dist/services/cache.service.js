"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var CacheService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const redis_1 = require("redis");
let CacheService = CacheService_1 = class CacheService {
    constructor(configService) {
        this.configService = configService;
        this.client = null;
        this.logger = new common_1.Logger(CacheService_1.name);
        this.isConnected = false;
        this.initializeRedis();
    }
    async initializeRedis() {
        const redisUrl = this.configService.get('REDIS_URL');
        if (!redisUrl) {
            this.logger.warn('Redis URL not configured. Caching will be disabled.');
            return;
        }
        try {
            this.client = (0, redis_1.createClient)({
                url: redisUrl,
            });
            this.client.on('error', (err) => {
                this.logger.error('Redis Client Error', err);
                this.isConnected = false;
            });
            this.client.on('connect', () => {
                this.logger.log('Redis Client Connected');
                this.isConnected = true;
            });
            await this.client.connect();
        }
        catch (error) {
            this.logger.error('Failed to initialize Redis', error);
            this.client = null;
        }
    }
    async get(key) {
        if (!this.client || !this.isConnected) {
            return null;
        }
        try {
            const value = await this.client.get(key);
            if (typeof value === 'string') {
                return JSON.parse(value);
            }
            return null;
        }
        catch (error) {
            this.logger.error(`Error getting key ${key}`, error);
            return null;
        }
    }
    async set(key, value, ttlSeconds) {
        if (!this.client || !this.isConnected) {
            return;
        }
        try {
            const stringValue = JSON.stringify(value);
            if (ttlSeconds) {
                await this.client.setEx(key, ttlSeconds, stringValue);
            }
            else {
                await this.client.set(key, stringValue);
            }
        }
        catch (error) {
            this.logger.error(`Error setting key ${key}`, error);
        }
    }
    async delete(key) {
        if (!this.client || !this.isConnected) {
            return;
        }
        try {
            await this.client.del(key);
        }
        catch (error) {
            this.logger.error(`Error deleting key ${key}`, error);
        }
    }
    async clear() {
        if (!this.client || !this.isConnected) {
            return;
        }
        try {
            await this.client.flushDb();
            this.logger.log('Cache cleared');
        }
        catch (error) {
            this.logger.error('Error clearing cache', error);
        }
    }
    async exists(key) {
        if (!this.client || !this.isConnected) {
            return false;
        }
        try {
            const result = await this.client.exists(key);
            return result === 1;
        }
        catch (error) {
            this.logger.error(`Error checking existence of key ${key}`, error);
            return false;
        }
    }
    async onModuleDestroy() {
        if (this.client && this.isConnected) {
            await this.client.quit();
            this.logger.log('Redis connection closed');
        }
    }
};
exports.CacheService = CacheService;
exports.CacheService = CacheService = CacheService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], CacheService);
//# sourceMappingURL=cache.service.js.map