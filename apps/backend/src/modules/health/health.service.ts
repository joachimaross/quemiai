import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface HealthCheck {
  status: 'healthy' | 'unhealthy';
  latency?: number;
  error?: string;
  details?: any;
}

export interface DependencyChecks {
  database: HealthCheck;
  redis: HealthCheck;
  aiService: HealthCheck;
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Check all critical dependencies
   */
  async checkDependencies(): Promise<DependencyChecks> {
    const [database, redis, aiService] = await Promise.allSettled([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkAIService(),
    ]);

    return {
      database: database.status === 'fulfilled' ? database.value : { status: 'unhealthy', error: database.reason?.message },
      redis: redis.status === 'fulfilled' ? redis.value : { status: 'unhealthy', error: redis.reason?.message },
      aiService: aiService.status === 'fulfilled' ? aiService.value : { status: 'unhealthy', error: aiService.reason?.message },
    };
  }

  /**
   * Check database connectivity
   */
  private async checkDatabase(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      // Try to import Prisma client dynamically
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      // Perform a simple query to check connectivity
      await prisma.$queryRaw`SELECT 1`;
      await prisma.$disconnect();

      const latency = Date.now() - startTime;
      return {
        status: 'healthy',
        latency,
      };
    } catch (error) {
      this.logger.error(`Database health check failed: ${error.message}`);
      return {
        status: 'unhealthy',
        error: error.message,
      };
    }
  }

  /**
   * Check Redis connectivity
   */
  private async checkRedis(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      const redisUrl = this.configService.get<string>('REDIS_URL');
      
      // Skip check if Redis is not configured
      if (!redisUrl) {
        return {
          status: 'healthy',
          details: 'Redis not configured (optional)',
        };
      }

      // Try to import Redis client dynamically
      const { createClient } = await import('redis');
      const redis = createClient({ url: redisUrl });
      
      await redis.connect();
      await redis.ping();
      await redis.quit();

      const latency = Date.now() - startTime;
      return {
        status: 'healthy',
        latency,
      };
    } catch (error) {
      this.logger.error(`Redis health check failed: ${error.message}`);
      return {
        status: 'unhealthy',
        error: error.message,
      };
    }
  }

  /**
   * Check AI service availability
   */
  private async checkAIService(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      // For now, just check if the OpenAI API key is configured
      const openaiKey = this.configService.get<string>('OPENAI_API_KEY');
      
      if (!openaiKey) {
        return {
          status: 'healthy',
          details: 'AI service not configured (optional)',
        };
      }

      // In a production environment, you might want to make a lightweight API call
      // to verify the service is actually reachable
      // For now, we just verify the configuration exists
      
      const latency = Date.now() - startTime;
      return {
        status: 'healthy',
        latency,
        details: 'API key configured',
      };
    } catch (error) {
      this.logger.error(`AI service health check failed: ${error.message}`);
      return {
        status: 'unhealthy',
        error: error.message,
      };
    }
  }

  /**
   * Get system information
   */
  async getSystemInfo() {
    return {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      memory: {
        total: process.memoryUsage().heapTotal,
        used: process.memoryUsage().heapUsed,
        external: process.memoryUsage().external,
      },
      uptime: process.uptime(),
      environment: this.configService.get<string>('NODE_ENV', 'development'),
    };
  }
}
