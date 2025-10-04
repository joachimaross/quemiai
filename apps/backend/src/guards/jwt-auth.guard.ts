import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

/**
 * JWT Authentication Guard
 * 
 * This guard validates JWT tokens in the Authorization header
 * and attaches the decoded user to the request object.
 * 
 * @example
 * Usage in controller:
 * ```typescript
 * @UseGuards(JwtAuthGuard)
 * @Get('profile')
 * async getProfile(@Request() req) {
 *   return req.user; // User from JWT payload
 * }
 * ```
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No authorization token provided');
    }

    try {
      // Verify and decode the JWT token
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      // Attach user to request object for use in route handlers
      request['user'] = payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return true;
  }

  /**
   * Extract JWT token from Authorization header
   * Supports: Bearer <token>
   */
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
