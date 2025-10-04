import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RESOURCE_KEY, OWNERSHIP_KEY } from '../decorators/resource-ownership.decorator';
import logger from '../config/logger';

/**
 * Guard to check if a user owns a resource or has permission to access it
 * Use with @ResourceOwnership decorator
 */
@Injectable()
export class ResourceOwnershipGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const resourceType = this.reflector.getAllAndOverride<string>(RESOURCE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const ownershipCheck = this.reflector.getAllAndOverride<
      (userId: string, resourceId: string) => Promise<boolean>
    >(OWNERSHIP_KEY, [context.getHandler(), context.getClass()]);

    if (!resourceType || !ownershipCheck) {
      // No ownership check required
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      logger.warn('Ownership check failed: No user in request');
      throw new ForbiddenException('User authentication required');
    }

    // Extract resource ID from params or body
    const resourceId = request.params.id || request.params.resourceId || request.body.id;

    if (!resourceId) {
      logger.warn('Ownership check failed: No resource ID provided');
      throw new ForbiddenException('Resource ID is required');
    }

    const userId = user.userId || user.sub;

    // Admin users bypass ownership checks
    if (user.role === 'admin' || user.role === 'super_admin') {
      logger.debug(`Admin user ${userId} bypassing ownership check for ${resourceType}`);
      return true;
    }

    // Check ownership
    const isOwner = await ownershipCheck(userId, resourceId);

    if (!isOwner) {
      logger.warn(`Ownership check failed: User ${userId} does not own ${resourceType} ${resourceId}`);
      throw new ForbiddenException('You do not have permission to access this resource');
    }

    logger.debug(`Ownership check passed: User ${userId} owns ${resourceType} ${resourceId}`);
    return true;
  }
}
