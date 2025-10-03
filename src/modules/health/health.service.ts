import { Injectable } from '@nestjs/common';
import { redisClient } from '../../config/redis';
import logger from '../../config/logger';

export interface HealthCheckResult {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  uptime: number;
  environment: string;
  checks?: {
    redis?: {
      status: 'ok' | 'error';
      message?: string;
      latency?: number;
    };
    database?: {
      status: 'ok' | 'error';
      message?: string;
      latency?: number;
    };
  };
}

@Injectable()
export class HealthService {
  async getHealth(): Promise<HealthCheckResult> {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    };
  }

  async getReadiness(): Promise<HealthCheckResult> {
    const checks = {
      redis: await this.checkRedis(),
    };

    // Determine overall status
    const hasError = Object.values(checks).some(
      (check) => check.status === 'error',
    );
    const status = hasError ? 'error' : 'ok';

    return {
      status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      checks,
    };
  }

  async getLiveness(): Promise<HealthCheckResult> {
    // Liveness is a quick check - just confirm the process is alive
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    };
  }

  private async checkRedis(): Promise<{
    status: 'ok' | 'error';
    message?: string;
    latency?: number;
  }> {
    try {
      const startTime = Date.now();

      // Check if Redis is connected
      if (!redisClient || !redisClient.isOpen) {
        return {
          status: 'error',
          message: 'Redis client not connected',
        };
      }

      // Ping Redis with timeout
      const pingPromise = redisClient.ping();
      const timeoutPromise = new Promise<string>((_, reject) =>
        setTimeout(() => reject(new Error('Redis ping timeout')), 5000),
      );

      await Promise.race([pingPromise, timeoutPromise]);

      const latency = Date.now() - startTime;

      return {
        status: 'ok',
        latency,
      };
    } catch (error) {
      logger.error({ err: error }, 'Redis health check failed');
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Redis check failed',
      };
    }
  }
}
