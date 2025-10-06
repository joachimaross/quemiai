import { Roles, UserRole, ROLES_KEY } from '../roles.decorator';
import { Reflector } from '@nestjs/core';

describe('Roles Decorator', () => {
  it('should set metadata with specified roles', () => {
    const roles = ['admin', 'moderator'];
    const decorator = Roles(...roles);
    
    // Create a dummy class and method to test the decorator
    class TestController {
      @Roles('admin', 'moderator')
      testMethod() {}
    }
    
    const reflector = new Reflector();
    const metadata = reflector.get(ROLES_KEY, TestController.prototype.testMethod);
    
    expect(metadata).toEqual(roles);
  });

  it('should have correct UserRole constants', () => {
    expect(UserRole.ADMIN).toBe('admin');
    expect(UserRole.MODERATOR).toBe('moderator');
    expect(UserRole.USER).toBe('user');
    expect(UserRole.GUEST).toBe('guest');
  });
});
