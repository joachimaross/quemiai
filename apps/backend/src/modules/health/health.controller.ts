import { Controller, Get, Header } from '@nestjs/common';
import { HealthService } from './health.service';
import { MetricsService } from './metrics.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly healthService: HealthService,
    private readonly metricsService: MetricsService,
  ) {}

  /**
   * Liveness probe - checks if the application is alive
   * This should always return 200 OK if the application is running
   * Used by orchestrators (K8s, ECS) to know if the pod/container is alive
   */
  @Get('live')
  async checkLiveness() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  /**
   * Readiness probe - checks if the application is ready to serve traffic
   * This checks all critical dependencies (DB, Redis, AI services)
   * Returns 503 if any dependency is unhealthy
   * Used by load balancers to know if the instance can receive traffic
   */
  @Get('ready')
  async checkReadiness() {
    const checks = await this.healthService.checkDependencies();
    const isHealthy = Object.values(checks).every((check) => check.status === 'healthy');

    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      checks,
      statusCode: isHealthy ? 200 : 503,
    };
  }

  /**
   * Detailed health check - provides comprehensive system information
   * Includes all dependency checks, resource usage, and version info
   */
  @Get()
  async checkHealth() {
    const [dependencies, systemInfo] = await Promise.all([
      this.healthService.checkDependencies(),
      this.healthService.getSystemInfo(),
    ]);

    const isHealthy = Object.values(dependencies).every((check) => check.status === 'healthy');

    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      dependencies,
      system: systemInfo,
      statusCode: isHealthy ? 200 : 503,
    };
  }

  /**
   * Prometheus metrics endpoint
   * Returns metrics in Prometheus format for scraping
   */
  @Get('metrics')
  @Header('Content-Type', 'text/plain')
  async getMetrics() {
    return this.metricsService.getMetrics();
  }
}
