import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[]; // Cache tags for invalidation
}

@Injectable()
export class CacheService implements OnModuleDestroy {
  private client: RedisClientType | null = null;
  private readonly logger = new Logger(CacheService.name);
  private isConnected = false;
  private readonly keyPrefix = 'quemiai:';

  constructor(private configService: ConfigService) {
    this.initializeRedis();
  }

  private async initializeRedis() {
    const redisUrl = this.configService.get<string>('REDIS_URL');

    if (!redisUrl) {
      this.logger.warn('Redis URL not configured. Caching will be disabled.');
      return;
    }

    try {
      this.client = createClient({
        url: redisUrl,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              this.logger.error('Max Redis reconnection attempts reached');
              return new Error('Max reconnection attempts reached');
            }
            // Exponential backoff: 100ms, 200ms, 400ms, etc.
            return Math.min(retries * 100, 3000);
          },
        },
      });

      this.client.on('error', (err) => {
        this.logger.error('Redis Client Error', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        this.logger.log('Redis Client Connected');
        this.isConnected = true;
      });

      this.client.on('reconnecting', () => {
        this.logger.warn('Redis Client Reconnecting...');
      });

      await this.client.connect();
    } catch (error) {
      this.logger.error('Failed to initialize Redis', error);
      this.client = null;
    }
  }

  /**
   * Get a value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.client || !this.isConnected) {
      return null;
    }

    try {
      const fullKey = this.getFullKey(key);
      const value = await this.client.get(fullKey);
      if (typeof value === 'string') {
        return JSON.parse(value) as T;
      }
      return null;
    } catch (error) {
      this.logger.error(`Error getting key ${key}`, error);
      return null;
    }
  }

  /**
   * Set a value in cache with optional TTL
   */
  async set(key: string, value: unknown, options?: CacheOptions): Promise<void> {
    if (!this.client || !this.isConnected) {
      return;
    }

    try {
      const fullKey = this.getFullKey(key);
      const stringValue = JSON.stringify(value);
      const ttl = options?.ttl || 3600; // Default 1 hour

      await this.client.setEx(fullKey, ttl, stringValue);

      // Store tags for invalidation if provided
      if (options?.tags && options.tags.length > 0) {
        await this.tagKey(fullKey, options.tags);
      }
    } catch (error) {
      this.logger.error(`Error setting key ${key}`, error);
    }
  }

  /**
   * Get or compute a value (cache-aside pattern)
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    options?: CacheOptions,
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // If not in cache, compute the value
    const value = await factory();

    // Store in cache for next time
    await this.set(key, value, options);

    return value;
  }

  /**
   * Delete a key from cache
   */
  async delete(key: string): Promise<void> {
    if (!this.client || !this.isConnected) {
      return;
    }

    try {
      const fullKey = this.getFullKey(key);
      await this.client.del(fullKey);
    } catch (error) {
      this.logger.error(`Error deleting key ${key}`, error);
    }
  }

  /**
   * Delete multiple keys by pattern
   */
  async deleteByPattern(pattern: string): Promise<void> {
    if (!this.client || !this.isConnected) {
      return;
    }

    try {
      const fullPattern = this.getFullKey(pattern);
      const keys = await this.client.keys(fullPattern);
      if (keys.length > 0) {
        await this.client.del(keys);
        this.logger.log(`Deleted ${keys.length} keys matching pattern ${pattern}`);
      }
    } catch (error) {
      this.logger.error(`Error deleting keys by pattern ${pattern}`, error);
    }
  }

  /**
   * Invalidate cache by tag
   */
  async invalidateByTag(tag: string): Promise<void> {
    if (!this.client || !this.isConnected) {
      return;
    }

    try {
      const tagKey = this.getTagKey(tag);
      const keys = await this.client.sMembers(tagKey);
      
      if (keys.length > 0) {
        await this.client.del(keys);
        await this.client.del(tagKey);
        this.logger.log(`Invalidated ${keys.length} keys with tag ${tag}`);
      }
    } catch (error) {
      this.logger.error(`Error invalidating by tag ${tag}`, error);
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    if (!this.client || !this.isConnected) {
      return;
    }

    try {
      const keys = await this.client.keys(`${this.keyPrefix}*`);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
      this.logger.log('Cache cleared');
    } catch (error) {
      this.logger.error('Error clearing cache', error);
    }
  }

  /**
   * Check if a key exists
   */
  async exists(key: string): Promise<boolean> {
    if (!this.client || !this.isConnected) {
      return false;
    }

    try {
      const fullKey = this.getFullKey(key);
      const result = await this.client.exists(fullKey);
      return result === 1;
    } catch (error) {
      this.logger.error(`Error checking existence of key ${key}`, error);
      return false;
    }
  }

  /**
   * Get TTL for a key
   */
  async getTTL(key: string): Promise<number> {
    if (!this.client || !this.isConnected) {
      return -1;
    }

    try {
      const fullKey = this.getFullKey(key);
      return await this.client.ttl(fullKey);
    } catch (error) {
      this.logger.error(`Error getting TTL for key ${key}`, error);
      return -1;
    }
  }

  /**
   * Increment a counter
   */
  async increment(key: string, by: number = 1): Promise<number> {
    if (!this.client || !this.isConnected) {
      return 0;
    }

    try {
      const fullKey = this.getFullKey(key);
      return await this.client.incrBy(fullKey, by);
    } catch (error) {
      this.logger.error(`Error incrementing key ${key}`, error);
      return 0;
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{ keys: number; memory: string }> {
    if (!this.client || !this.isConnected) {
      return { keys: 0, memory: '0' };
    }

    try {
      const keys = await this.client.keys(`${this.keyPrefix}*`);
      const info = await this.client.info('memory');
      const memoryMatch = info.match(/used_memory_human:([^\r\n]+)/);
      const memory = memoryMatch ? memoryMatch[1] : '0';

      return {
        keys: keys.length,
        memory,
      };
    } catch (error) {
      this.logger.error('Error getting cache stats', error);
      return { keys: 0, memory: '0' };
    }
  }

  /**
   * Check if Redis is connected
   */
  isRedisConnected(): boolean {
    return this.isConnected;
  }

  // Private helper methods

  private getFullKey(key: string): string {
    return `${this.keyPrefix}${key}`;
  }

  private getTagKey(tag: string): string {
    return `${this.keyPrefix}tag:${tag}`;
  }

  private async tagKey(key: string, tags: string[]): Promise<void> {
    for (const tag of tags) {
      const tagKey = this.getTagKey(tag);
      await this.client?.sAdd(tagKey, key);
    }
  }

  async onModuleDestroy() {
    if (this.client && this.isConnected) {
      await this.client.quit();
      this.logger.log('Redis connection closed');
    }
  }
}
