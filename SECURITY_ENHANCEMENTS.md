# Security Enhancements Implementation Guide

## Overview

This guide covers the security enhancements implemented in the Quemiai application, including Role-Based Access Control (RBAC), Multi-Factor Authentication (MFA), and enhanced security headers.

## Role-Based Access Control (RBAC)

### Implementation

The RBAC system uses decorators and guards to control access to routes based on user roles.

#### Available Roles

```typescript
export const UserRole = {
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  USER: 'user',
  GUEST: 'guest',
} as const;
```

#### Usage

1. **Apply the @Roles decorator to protected routes:**

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { Roles, UserRole } from '@/decorators/roles.decorator';
import { RolesGuard } from '@/guards/roles.guard';
import { JwtAuthGuard } from '@/guards/jwt-auth.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  
  @Get('users')
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  getAllUsers() {
    // Only admins and moderators can access
    return this.userService.findAll();
  }

  @Get('settings')
  @Roles(UserRole.ADMIN)
  getSettings() {
    // Only admins can access
    return this.settingsService.getAll();
  }
}
```

2. **Ensure user object includes roles:**

Your JWT payload or user object should include a `roles` array:

```typescript
interface User {
  id: string;
  email: string;
  roles: string[]; // e.g., ['user', 'moderator']
}
```

3. **Register the RolesGuard globally (optional):**

```typescript
// app.module.ts
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './guards/roles.guard';

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
```

## Multi-Factor Authentication (MFA)

### Implementation

The MFA service provides TOTP (Time-based One-Time Password) functionality using authenticator apps like Google Authenticator or Authy.

#### Setup MFA for a User

```typescript
import { MfaService } from '@/modules/auth/mfa.service';

@Injectable()
export class AuthService {
  constructor(private readonly mfaService: MfaService) {}

  async enableMfaForUser(userId: string, email: string) {
    // Generate a secret for the user
    const secret = this.mfaService.generateSecret();
    
    // Generate QR code URL
    const qrCodeUrl = this.mfaService.generateQrCodeUrl(secret, email);
    
    // Generate backup codes
    const backupCodes = this.mfaService.generateBackupCodes();
    
    // Store the secret and hashed backup codes in the database
    await this.userRepository.update(userId, {
      mfaSecret: secret,
      mfaEnabled: false, // Will be enabled after verification
      backupCodes: backupCodes.map(code => 
        this.mfaService.hashBackupCode(code)
      ),
    });
    
    return {
      secret,
      qrCodeUrl,
      backupCodes, // Show these to the user ONCE
    };
  }
}
```

#### Verify MFA Token

```typescript
async verifyMfaToken(userId: string, token: string) {
  const user = await this.userRepository.findById(userId);
  
  if (!user.mfaSecret) {
    throw new Error('MFA not configured');
  }
  
  const isValid = this.mfaService.verifyToken(token, user.mfaSecret);
  
  if (isValid && !user.mfaEnabled) {
    // First successful verification - enable MFA
    await this.userRepository.update(userId, { mfaEnabled: true });
  }
  
  return isValid;
}
```

#### Use Backup Codes

```typescript
async verifyBackupCode(userId: string, code: string) {
  const user = await this.userRepository.findById(userId);
  
  for (const hashedCode of user.backupCodes) {
    if (this.mfaService.verifyBackupCode(code, hashedCode)) {
      // Code is valid - remove it from the list (one-time use)
      await this.userRepository.update(userId, {
        backupCodes: user.backupCodes.filter(c => c !== hashedCode),
      });
      return true;
    }
  }
  
  return false;
}
```

#### Login Flow with MFA

```typescript
async login(email: string, password: string) {
  const user = await this.validateUser(email, password);
  
  if (user.mfaEnabled) {
    // Return a temporary token that requires MFA verification
    return {
      requiresMfa: true,
      tempToken: this.generateTempToken(user.id),
    };
  }
  
  // Normal login without MFA
  return {
    accessToken: this.generateAccessToken(user),
  };
}

async verifyMfaAndLogin(tempToken: string, mfaToken: string) {
  const userId = this.validateTempToken(tempToken);
  const isValid = await this.verifyMfaToken(userId, mfaToken);
  
  if (!isValid) {
    throw new UnauthorizedException('Invalid MFA token');
  }
  
  const user = await this.userRepository.findById(userId);
  return {
    accessToken: this.generateAccessToken(user),
  };
}
```

## Enhanced Security Headers

### Configuration

The application uses Helmet middleware with comprehensive security headers:

```typescript
// main.ts
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    noSniff: true,
    frameguard: { action: 'deny' },
    xssFilter: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  }),
);
```

### Security Headers Explained

1. **Content-Security-Policy (CSP)**: Prevents XSS attacks by restricting resource loading
2. **Strict-Transport-Security (HSTS)**: Forces HTTPS connections
3. **X-Content-Type-Options**: Prevents MIME type sniffing
4. **X-Frame-Options**: Prevents clickjacking attacks
5. **X-XSS-Protection**: Legacy XSS protection for older browsers
6. **Referrer-Policy**: Controls referrer information in requests

### Customizing CSP

If you need to allow additional sources (e.g., for CDNs), update the CSP directives:

```typescript
contentSecurityPolicy: {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", 'https://cdn.example.com'],
    imgSrc: ["'self'", 'data:', 'https:', 'https://images.example.com'],
    // ... other directives
  },
}
```

## API Documentation with Swagger

### Enabling Swagger

Set the environment variable:

```bash
SWAGGER_ENABLED=true
```

### Accessing Documentation

Once enabled, Swagger UI is available at:

```
http://localhost:3000/api/docs
```

### Adding API Documentation

Use Swagger decorators in your controllers:

```typescript
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  
  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.usersService.findAll();
  }
}
```

## Testing

### Running Tests

```bash
# Run all tests
pnpm run test

# Run with coverage
pnpm run test:cov

# Run specific test
pnpm run test -- src/modules/auth/__tests__/mfa.service.spec.ts
```

### Coverage Thresholds

The project enforces 75% coverage across:
- Branches
- Functions
- Lines
- Statements

Configure in `jest.config.js`:

```javascript
coverageThreshold: {
  global: {
    branches: 75,
    functions: 75,
    lines: 75,
    statements: 75,
  },
}
```

## Best Practices

1. **RBAC**:
   - Use the most restrictive roles by default
   - Regularly audit role assignments
   - Document which roles have access to which resources

2. **MFA**:
   - Always provide backup codes
   - Store MFA secrets securely (encrypted at rest)
   - Allow users to disable MFA with proper verification

3. **Security Headers**:
   - Test CSP in development before deploying to production
   - Monitor for CSP violations using report-uri directive
   - Keep security headers up to date

4. **Testing**:
   - Write tests for all security-critical code
   - Test both positive and negative cases
   - Include integration tests for authentication flows

## Troubleshooting

### MFA Token Not Working

- Ensure system time is synchronized (TOTP is time-based)
- Verify the secret is stored correctly
- Check if the token hasn't expired (30-second window)

### RBAC Not Enforcing

- Verify RolesGuard is registered
- Check user object includes roles array
- Ensure JWT includes roles in payload

### CSP Blocking Resources

- Check browser console for CSP violations
- Update CSP directives to allow legitimate sources
- Use `report-uri` to monitor violations in production

## Security Checklist

- [ ] RBAC implemented for all protected routes
- [ ] MFA available for user accounts
- [ ] Security headers configured with Helmet
- [ ] Swagger documentation enabled (development only)
- [ ] Test coverage meets 75% threshold
- [ ] Database indexes optimized
- [ ] Secrets stored securely (encrypted at rest)
- [ ] Regular security audits scheduled
- [ ] Dependency vulnerabilities monitored
- [ ] Rate limiting configured appropriately
