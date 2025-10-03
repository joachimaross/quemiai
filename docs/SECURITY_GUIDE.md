# Security Guide

This guide provides comprehensive information on security measures implemented in the Quemiai platform.

## Table of Contents

- [Security Headers](#security-headers)
- [Vulnerability Scanning](#vulnerability-scanning)
- [Authentication & Authorization](#authentication--authorization)
- [Data Protection](#data-protection)
- [API Security](#api-security)
- [Best Practices](#best-practices)

## Security Headers

### Helmet Configuration

The application uses [Helmet](https://helmetjs.github.io/) to set secure HTTP headers. Configuration is in `src/config/security.config.ts`.

#### Enabled Headers

**Content-Security-Policy (CSP)**
```
default-src 'self';
style-src 'self' 'unsafe-inline';
script-src 'self';
img-src 'self' data: https:;
connect-src 'self';
font-src 'self';
object-src 'none';
media-src 'self';
frame-src 'none';
```

**Purpose:** Prevents XSS attacks by controlling resource loading.

**Strict-Transport-Security (HSTS)**
```
max-age=31536000; includeSubDomains; preload
```

**Purpose:** Forces HTTPS connections for 1 year, including subdomains.

**X-Frame-Options**
```
DENY
```

**Purpose:** Prevents clickjacking by blocking iframe embedding.

**X-Content-Type-Options**
```
nosniff
```

**Purpose:** Prevents MIME type sniffing attacks.

**Referrer-Policy**
```
strict-origin-when-cross-origin
```

**Purpose:** Controls how much referrer information is sent with requests.

**X-XSS-Protection**
```
1; mode=block
```

**Purpose:** Enables browser's XSS filter (legacy support).

### CORS Configuration

Configured in `src/config/security.config.ts`:

```typescript
{
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  methods: 'GET,POST,PUT,DELETE,PATCH,OPTIONS',
  credentials: true,
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-Correlation-ID',
  ],
  exposedHeaders: ['X-Correlation-ID'],
  maxAge: 86400, // 24 hours
}
```

**Environment Variables:**
- `FRONTEND_URL`: Allowed origin for CORS (default: http://localhost:3001)

### Testing Security Headers

Use the [Security Headers](https://securityheaders.com/) online tool or:

```bash
curl -I https://your-api.com/health
```

Expected headers:
- `Strict-Transport-Security`
- `X-Frame-Options`
- `X-Content-Type-Options`
- `Referrer-Policy`
- `Content-Security-Policy`

## Vulnerability Scanning

### Automated Scans

The application runs automated security scans via GitHub Actions (`.github/workflows/security-scan.yml`):

#### 1. NPM Audit

**Frequency:** Every push, PR, and weekly schedule

**What it checks:** Known vulnerabilities in npm dependencies

**Run manually:**
```bash
npm audit
```

**Fix vulnerabilities:**
```bash
npm audit fix
```

**For breaking changes:**
```bash
npm audit fix --force
```

#### 2. Dependency Review

**Frequency:** On pull requests

**What it checks:**
- New dependencies introduced
- Dependency license compatibility
- Known vulnerabilities in new dependencies

#### 3. Trivy Scanner

**Frequency:** Every push, PR, and weekly

**What it checks:**
- Vulnerabilities in dependencies
- Misconfigurations
- Secrets in code

**Run manually:**
```bash
# Install Trivy
brew install aquasecurity/trivy/trivy  # macOS
# or
apt-get install trivy  # Ubuntu

# Scan
trivy fs .
```

#### 4. Snyk Scan

**Frequency:** Every push and PR (requires SNYK_TOKEN)

**What it checks:**
- Vulnerabilities in dependencies
- License compliance
- Code security issues

**Setup:**
1. Sign up at [snyk.io](https://snyk.io)
2. Get API token from account settings
3. Add `SNYK_TOKEN` to GitHub repository secrets

**Run manually:**
```bash
npm install -g snyk
snyk auth
snyk test
```

#### 5. CodeQL Analysis

**Frequency:** Every push, PR, and weekly

**What it checks:**
- Code vulnerabilities (SQL injection, XSS, etc.)
- Code quality issues
- Security anti-patterns

**Run manually:** Use GitHub's CodeQL CLI or run via GitHub Actions

### Monitoring Scan Results

1. **GitHub Security Tab**
   - Navigate to repository → Security → Code scanning alerts
   - Review and dismiss false positives
   - Create issues for real vulnerabilities

2. **Dependabot Alerts**
   - Enable in Settings → Security & analysis
   - Automatically creates PRs for dependency updates

3. **Security Advisories**
   - Private disclosure of vulnerabilities
   - Access via Security → Advisories

## Authentication & Authorization

### Current Implementation

The application uses JWT-based authentication with:
- Access tokens (short-lived)
- Refresh tokens (long-lived)
- Token blacklisting on logout

### JWT Configuration

Configure in `src/config/security.config.ts`:

```typescript
{
  accessTokenExpiry: '15m',   // Access token lifespan
  refreshTokenExpiry: '7d',   // Refresh token lifespan
  algorithm: 'HS256',         // Signing algorithm
}
```

**Environment Variables:**
- `JWT_SECRET`: Secret key for signing tokens (required)
- `JWT_ACCESS_TOKEN_EXPIRY`: Access token expiry (default: 15m)
- `JWT_REFRESH_TOKEN_EXPIRY`: Refresh token expiry (default: 7d)

### Best Practices

1. **Token Storage**
   - Never store tokens in localStorage
   - Use httpOnly cookies for refresh tokens
   - Use memory/session storage for access tokens

2. **Token Rotation**
   - Rotate refresh tokens on use
   - Implement token families for breach detection

3. **Token Validation**
   - Validate token signature
   - Check expiration
   - Verify token hasn't been blacklisted

## Data Protection

### Sensitive Data Handling

**Never log sensitive data:**
- Passwords
- API keys
- JWT tokens
- Credit card numbers
- Personal Identifiable Information (PII)

**Use structured logging:**
```typescript
// Bad
logger.info(`User ${user.email} logged in with password ${password}`);

// Good
logger.info({ userId: user.id }, 'User logged in');
```

### Password Security

1. **Hashing:** Use bcrypt with at least 10 salt rounds
2. **Validation:** Enforce strong password requirements
3. **Storage:** Never store plaintext passwords
4. **Rotation:** Encourage periodic password changes

### Data Encryption

**At Rest:**
- Encrypt database backups
- Encrypt sensitive fields (e.g., SSN, credit cards)
- Use database-level encryption when possible

**In Transit:**
- Always use HTTPS in production
- Use TLS 1.2 or higher
- Implement certificate pinning for mobile apps

### Environment Variables

**Security checklist:**
- ✅ Use `.env` file for local development
- ✅ Add `.env` to `.gitignore`
- ✅ Never commit secrets to version control
- ✅ Use secret management service in production (AWS Secrets Manager, Azure Key Vault, etc.)
- ✅ Rotate secrets regularly
- ✅ Use different secrets for each environment

## API Security

### Rate Limiting

Configured via `@nestjs/throttler`:

```typescript
{
  ttl: 60000,  // Time window: 60 seconds
  limit: 100,  // Max 100 requests per window
}
```

**Customize per endpoint:**
```typescript
@UseGuards(ThrottlerGuard)
@Throttle(10, 60) // 10 requests per minute
@Get('sensitive-endpoint')
async sensitiveOperation() {
  // ...
}
```

### Input Validation

Use `class-validator` decorators:

```typescript
import { IsString, IsEmail, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}
```

**Global validation pipe** is configured in `main.ts`:
```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,           // Remove unknown properties
    forbidNonWhitelisted: true, // Throw error for unknown properties
    transform: true,            // Auto-transform types
  }),
);
```

### SQL Injection Prevention

**Using Prisma (ORM):**
- Parameterized queries by default
- Type-safe query building
- No raw SQL (unless explicitly needed)

**If using raw SQL:**
```typescript
// Bad - vulnerable to SQL injection
const users = await prisma.$queryRaw`
  SELECT * FROM users WHERE email = '${email}'
`;

// Good - parameterized query
const users = await prisma.$queryRaw`
  SELECT * FROM users WHERE email = ${email}
`;
```

### XSS Prevention

1. **Input Sanitization:** Validate and sanitize user input
2. **Output Encoding:** Encode data before rendering
3. **CSP Headers:** Implemented via Helmet
4. **HTTP-only Cookies:** For sensitive tokens

### CSRF Protection

For stateful sessions:
```bash
npm install csurf
```

```typescript
import * as csurf from 'csurf';

app.use(csurf());
```

Not needed for stateless JWT authentication if:
- Tokens stored in Authorization header (not cookies)
- Custom headers required for mutations

## Best Practices

### Development

1. **Code Reviews**
   - Require approval for security-sensitive changes
   - Use automated security scanning in PRs
   - Follow OWASP Top 10 guidelines

2. **Dependency Management**
   - Keep dependencies up to date
   - Review dependency changes before updating
   - Use lock files (package-lock.json)
   - Audit dependencies regularly

3. **Secrets Management**
   - Never commit secrets to version control
   - Use environment variables
   - Rotate secrets regularly
   - Use different secrets per environment

### Production

1. **Monitoring**
   - Monitor failed login attempts
   - Alert on suspicious activity
   - Track API abuse patterns
   - Log security events

2. **Incident Response**
   - Have an incident response plan
   - Know how to revoke compromised tokens
   - Have database backup/restore procedures
   - Document security contact information

3. **Updates**
   - Apply security patches promptly
   - Test updates in staging first
   - Have rollback plan
   - Subscribe to security advisories

### Testing

1. **Security Testing**
   - Penetration testing (annually or after major changes)
   - Vulnerability scanning (automated)
   - Security code reviews
   - Threat modeling

2. **Automated Tests**
   ```bash
   # Run security tests
   npm audit
   npm run test:security  # If you have security-specific tests
   ```

### Compliance

Depending on your use case:
- **GDPR:** Data protection and privacy (EU)
- **CCPA:** Consumer privacy (California)
- **HIPAA:** Healthcare data (US)
- **PCI DSS:** Payment card data
- **SOC 2:** Security and availability

## Security Checklist

### Pre-Production

- [ ] All environment variables configured
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Input validation implemented
- [ ] Authentication/authorization working
- [ ] Secrets not in version control
- [ ] Dependencies audited
- [ ] Security scanning passing
- [ ] Logging configured (no sensitive data)
- [ ] CORS configured correctly
- [ ] Database connections secured
- [ ] Backup strategy in place

### Ongoing

- [ ] Weekly dependency updates
- [ ] Monthly security audits
- [ ] Quarterly penetration testing
- [ ] Regular log review
- [ ] Incident response plan tested
- [ ] Team security training
- [ ] Compliance requirements met

## Reporting Security Issues

If you discover a security vulnerability:

1. **Do NOT** open a public GitHub issue
2. Email: security@quemiai.com
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We will acknowledge receipt within 24 hours and provide a detailed response within 7 days.

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [NestJS Security](https://docs.nestjs.com/security/helmet)
- [Helmet.js Documentation](https://helmetjs.github.io/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

**Last Updated:** December 2024  
**Maintained by:** Quemiai Security Team
