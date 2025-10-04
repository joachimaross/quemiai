import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

/**
 * Role-Based Access Control (RBAC) Guard
 *
 * This guard checks if the authenticated user has the required role(s)
 * to access a protected route.
 *
 * @example
 * Usage in controller:
 * ```typescript
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Roles('admin', 'moderator')
 * @Get('admin/dashboard')
 * async getAdminDashboard() {
 *   // Only admins and moderators can access this
 * }
 * ```
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get required roles from decorator metadata
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Get user from request
    const { user } = context.switchToHttp().getRequest();

    // If no user is authenticated, deny access
    if (!user) {
      return false;
    }

    // Check if user has any of the required roles
    // User can have a single role (string) or multiple roles (array)
    const userRoles = Array.isArray(user.roles) ? user.roles : [user.role];

    return requiredRoles.some((role) => userRoles.includes(role));
  }
}
