import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from '../jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    jwtService = module.get<JwtService>(JwtService);
  });

  const mockExecutionContext = (authHeader?: string): ExecutionContext => {
    const request = {
      headers: {
        authorization: authHeader,
      },
    };

    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as ExecutionContext;
  };

  describe('canActivate', () => {
    it('should return true and attach user to request when token is valid', async () => {
      const mockPayload = { sub: 'user-123', email: 'test@example.com', roles: ['user'] };
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(mockPayload);

      const context = mockExecutionContext('Bearer valid-token');
      const request = context.switchToHttp().getRequest();

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(request['user']).toEqual(mockPayload);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-token', {
        secret: process.env.JWT_SECRET,
      });
    });

    it('should throw UnauthorizedException when no token is provided', async () => {
      const context = mockExecutionContext();

      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
      await expect(guard.canActivate(context)).rejects.toThrow('No authorization token provided');
    });

    it('should throw UnauthorizedException when token format is invalid', async () => {
      const context = mockExecutionContext('InvalidFormat token');

      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
      await expect(guard.canActivate(context)).rejects.toThrow('No authorization token provided');
    });

    it('should throw UnauthorizedException when token is expired', async () => {
      jest.spyOn(jwtService, 'verifyAsync').mockRejectedValue(new Error('Token expired'));

      const context = mockExecutionContext('Bearer expired-token');

      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
      await expect(guard.canActivate(context)).rejects.toThrow('Invalid or expired token');
    });

    it('should throw UnauthorizedException when token is malformed', async () => {
      jest.spyOn(jwtService, 'verifyAsync').mockRejectedValue(new Error('Malformed token'));

      const context = mockExecutionContext('Bearer malformed-token');

      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
      await expect(guard.canActivate(context)).rejects.toThrow('Invalid or expired token');
    });
  });
});
