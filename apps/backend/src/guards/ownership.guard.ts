import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * Resource Ownership Guard
 * 
 * This guard checks if the authenticated user is the owner of a resource
 * or has administrative privileges.
 * 
 * Use this guard to ensure users can only access their own resources.
 * 
 * @example
 * ```typescript
 * @UseGuards(JwtAuthGuard, OwnershipGuard)
 * @Get('posts/:id')
 * async getPost(@Param('id') id: string, @Request() req) {
 *   // Only the post owner or admin can access
 * }
 * ```
 */
@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // If no user is authenticated, deny access
    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // Admins can access any resource
    const userRoles = Array.isArray(user.roles) ? user.roles : [user.role];
    if (userRoles.includes('admin')) {
      return true;
    }

    // Check ownership based on userId in params or body
    const resourceUserId = request.params.userId || request.body.userId;
    
    if (resourceUserId && resourceUserId !== user.id) {
      throw new ForbiddenException('You do not have permission to access this resource');
    }

    return true;
  }
}
