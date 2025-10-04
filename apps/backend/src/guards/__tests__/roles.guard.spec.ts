import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { RolesGuard } from '../roles.guard';
import { ROLES_KEY } from '../roles.decorator';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  const mockExecutionContext = (user?: any): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as any;
  };

  describe('canActivate', () => {
    it('should return true when no roles are required', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

      const context = mockExecutionContext({ id: 'user-123' });
      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should return true when user has one of the required roles (array)', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin', 'moderator']);

      const context = mockExecutionContext({
        id: 'user-123',
        roles: ['admin', 'user'],
      });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should return true when user has the required role (single role)', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);

      const context = mockExecutionContext({
        id: 'user-123',
        role: 'admin',
      });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should return false when user does not have required roles', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin', 'moderator']);

      const context = mockExecutionContext({
        id: 'user-123',
        roles: ['user'],
      });

      const result = guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should return false when no user is authenticated', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);

      const context = mockExecutionContext(undefined);
      const result = guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should return false when user has no roles', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);

      const context = mockExecutionContext({
        id: 'user-123',
      });

      const result = guard.canActivate(context);

      expect(result).toBe(false);
    });

    it('should handle multiple required roles correctly', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin', 'moderator', 'editor']);

      const contextWithModerator = mockExecutionContext({
        id: 'user-123',
        roles: ['moderator'],
      });

      expect(guard.canActivate(contextWithModerator)).toBe(true);

      const contextWithUser = mockExecutionContext({
        id: 'user-456',
        roles: ['user'],
      });

      expect(guard.canActivate(contextWithUser)).toBe(false);
    });

    it('should work with single role as string', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);

      const context = mockExecutionContext({
        id: 'user-123',
        role: 'admin',
      });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });
  });
});
