import { SetMetadata } from '@nestjs/common';

/**
 * Roles decorator for role-based access control (RBAC)
 * Use this decorator to restrict access to routes based on user roles
 * 
 * @example
 * ```typescript
 * @Roles('admin', 'moderator')
 * @Get('users')
 * async getUsers() {
 *   return this.usersService.findAll();
 * }
 * ```
 */
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

/**
 * Common role constants for reusability
 */
export const UserRole = {
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  USER: 'user',
  GUEST: 'guest',
} as const;

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];
