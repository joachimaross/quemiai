import { SetMetadata } from '@nestjs/common';

/**
 * Decorator to specify required roles for a route
 * @param roles - Array of role names that are allowed to access the route
 *
 * @example
 * ```typescript
 * @Roles('admin', 'moderator')
 * @Get('admin/users')
 * async getUsers() {
 *   // Only admins and moderators can access this
 * }
 * ```
 */
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
