import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { OwnershipGuard } from '../ownership.guard';

describe('OwnershipGuard', () => {
  let guard: OwnershipGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OwnershipGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<OwnershipGuard>(OwnershipGuard);
  });

  const mockExecutionContext = (
    user?: unknown,
    params?: unknown,
    body?: unknown,
  ): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          user,
          params: params || {},
          body: body || {},
        }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;
  };

  describe('canActivate', () => {
    it('should throw ForbiddenException when no user is authenticated', async () => {
      const context = mockExecutionContext(undefined);

      await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
      await expect(guard.canActivate(context)).rejects.toThrow('Authentication required');
    });

    it('should return true for admin users regardless of ownership', async () => {
      const context = mockExecutionContext(
        { id: 'admin-123', roles: ['admin'] },
        { userId: 'other-user-456' },
      );

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should return true when user owns the resource (userId in params)', async () => {
      const context = mockExecutionContext(
        { id: 'user-123', roles: ['user'] },
        { userId: 'user-123' },
      );

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should return true when user owns the resource (userId in body)', async () => {
      const context = mockExecutionContext(
        { id: 'user-123', roles: ['user'] },
        {},
        { userId: 'user-123' },
      );

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should throw ForbiddenException when user does not own the resource', async () => {
      const context = mockExecutionContext(
        { id: 'user-123', roles: ['user'] },
        { userId: 'other-user-456' },
      );

      await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
      await expect(guard.canActivate(context)).rejects.toThrow(
        'You do not have permission to access this resource',
      );
    });

    it('should return true when no userId is specified in params or body', async () => {
      const context = mockExecutionContext({ id: 'user-123', roles: ['user'] }, {}, {});

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should work with single role as string', async () => {
      const adminContext = mockExecutionContext(
        { id: 'admin-123', role: 'admin' },
        { userId: 'other-user-456' },
      );

      const result = await guard.canActivate(adminContext);

      expect(result).toBe(true);
    });

    it('should prioritize userId in params over body', async () => {
      const context = mockExecutionContext(
        { id: 'user-123', roles: ['user'] },
        { userId: 'user-123' },
        { userId: 'other-user-456' },
      );

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });
  });
});
