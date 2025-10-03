import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Basic health check',
    description: 'Returns the basic health status of the application including uptime and environment'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Application is healthy',
    schema: {
      example: {
        status: 'ok',
        timestamp: '2024-01-01T00:00:00.000Z',
        uptime: 3600,
        environment: 'production'
      }
    }
  })
  async getHealth(@Res() res: Response) {
    const health = await this.healthService.getHealth();
    return res.status(HttpStatus.OK).json(health);
  }

  @Get('ready')
  @ApiOperation({ 
    summary: 'Readiness probe',
    description: 'Checks if the application is ready to receive traffic by verifying critical dependencies (Redis, Database)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Application is ready to receive traffic',
    schema: {
      example: {
        status: 'ok',
        timestamp: '2024-01-01T00:00:00.000Z',
        uptime: 3600,
        environment: 'production',
        checks: {
          redis: {
            status: 'ok',
            latency: 5
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 503, 
    description: 'Application is not ready - dependency check failed',
    schema: {
      example: {
        status: 'error',
        timestamp: '2024-01-01T00:00:00.000Z',
        uptime: 3600,
        environment: 'production',
        checks: {
          redis: {
            status: 'error',
            message: 'Redis client not connected'
          }
        }
      }
    }
  })
  async getReadiness(@Res() res: Response) {
    const readiness = await this.healthService.getReadiness();

    // Return 503 if not ready
    const statusCode =
      readiness.status === 'error'
        ? HttpStatus.SERVICE_UNAVAILABLE
        : HttpStatus.OK;

    return res.status(statusCode).json(readiness);
  }

  @Get('live')
  @ApiOperation({ 
    summary: 'Liveness probe',
    description: 'Quick check to verify the application process is alive and responsive'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Application is alive',
    schema: {
      example: {
        status: 'ok',
        timestamp: '2024-01-01T00:00:00.000Z',
        uptime: 3600,
        environment: 'production'
      }
    }
  })
  async getLiveness(@Res() res: Response) {
    const liveness = await this.healthService.getLiveness();
    return res.status(HttpStatus.OK).json(liveness);
  }
}
