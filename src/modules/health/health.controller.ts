import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { Response } from 'express';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async getHealth(@Res() res: Response) {
    const health = await this.healthService.getHealth();
    return res.status(HttpStatus.OK).json(health);
  }

  @Get('ready')
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
  async getLiveness(@Res() res: Response) {
    const liveness = await this.healthService.getLiveness();
    return res.status(HttpStatus.OK).json(liveness);
  }
}
