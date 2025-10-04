import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../guards/roles.guard';

export const ROLES_KEY = 'roles';

/**
 * Decorator to specify required roles for a route
 * @param roles - Array of roles that are allowed to access the route
 * @example
 * @Roles(UserRole.ADMIN, UserRole.MODERATOR)
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * async updateUser() { ... }
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
