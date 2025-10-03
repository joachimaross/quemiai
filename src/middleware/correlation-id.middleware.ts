import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const correlationId =
      (req.headers['x-correlation-id'] as string) || uuidv4();

    // Attach to request object
    req['correlationId'] = correlationId;

    // Add to response headers for client-side tracing
    res.setHeader('x-correlation-id', correlationId);

    next();
  }
}
