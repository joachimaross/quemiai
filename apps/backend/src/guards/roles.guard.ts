import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import logger from '../config/logger';

export enum UserRole {
  USER = 'user',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      // No roles required, allow access
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      logger.warn('Authorization failed: No user in request');
      throw new ForbiddenException('User authentication required');
    }

    const hasRole = requiredRoles.some((role) => user.role === role || user.roles?.includes(role));

    if (!hasRole) {
      logger.warn(`Authorization failed: User ${user.userId || user.sub} lacks required roles`);
      throw new ForbiddenException('Insufficient permissions');
    }

    logger.debug(`Authorization successful: User ${user.userId || user.sub} has required role`);
    return true;
  }
}
