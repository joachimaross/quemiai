# Developer Experience Guide

This guide provides comprehensive information for developers working on the Quemiai platform.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Code Quality](#code-quality)
- [CI/CD Pipeline](#cicd-pipeline)
- [Best Practices](#best-practices)

## Getting Started

### Prerequisites

- **Node.js**: v18 or higher
- **npm**: v8 or higher
- **PostgreSQL**: v14 or higher (optional for full functionality)
- **Redis**: v6 or higher (optional for full functionality)
- **Git**: Latest version

### Initial Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/joachimaross/quemiai.git
   cd quemiai
   ```

2. **Install dependencies:**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration:
   ```env
   PORT=4000
   NODE_ENV=development
   DATABASE_URL=postgresql://user:password@localhost:5432/quemiai
   REDIS_URL=redis://localhost:6379
   JWT_SECRET=your-secret-key
   FRONTEND_URL=http://localhost:3001
   ```

4. **Build the project:**
   ```bash
   npm run build
   ```

5. **Start development server:**
   ```bash
   npm run start:dev
   ```

The API will be available at http://localhost:4000

## Development Workflow

### Project Structure

```
quemiai/
├── src/
│   ├── api/              # Legacy API routes
│   ├── config/           # Configuration files
│   ├── filters/          # Exception filters
│   ├── interceptors/     # HTTP interceptors
│   ├── middleware/       # Express middleware
│   ├── metrics/          # Prometheus metrics
│   ├── modules/          # NestJS modules
│   │   ├── chat/        # Chat module
│   │   ├── courses/     # Courses module
│   │   ├── health/      # Health checks
│   │   └── stories/     # Stories module
│   ├── services/         # Shared services
│   ├── utils/            # Utility functions
│   ├── app.module.ts     # Root module
│   ├── app.controller.ts # Root controller
│   └── main.ts           # Application entry point
├── tests/
│   ├── load/            # Load testing scripts
│   └── ...              # Unit and E2E tests
├── docs/                # Documentation
├── .github/             # GitHub Actions workflows
└── package.json
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run start` | Start production server |
| `npm run start:dev` | Start development server with hot reload |
| `npm run start:debug` | Start with debugging enabled |
| `npm run build` | Build for production |
| `npm run lint` | Lint and auto-fix code |
| `npm run lint:check` | Lint without auto-fix |
| `npm test` | Run unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:cov` | Run tests with coverage |
| `npm run test:e2e` | Run end-to-end tests |
| `npm run load:test` | Run API load tests |
| `npm run load:test:mixed` | Run mixed workload tests |

### Git Workflow

We follow the [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/) branching model:

**Branch Types:**
- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Production hotfixes
- `release/*` - Release preparation

**Creating a Feature:**

```bash
# Create feature branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/your-feature-name
```

**Commit Message Convention:**

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements

**Examples:**
```bash
git commit -m "feat(auth): add JWT refresh token support"
git commit -m "fix(health): correct Redis connection check"
git commit -m "docs: update API documentation"
```

## API Documentation

### Swagger/OpenAPI

The API is documented using Swagger/OpenAPI 3.0.

**Access Swagger UI:**
- Local: http://localhost:4000/api/docs
- Production: https://api.quemiai.com/api/docs

**Features:**
- Interactive API exploration
- Request/response examples
- Schema definitions
- Try-it-out functionality
- JWT authentication

### Adding API Documentation

**For Controllers:**

```typescript
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  @Get(':id')
  @ApiOperation({ 
    summary: 'Get user by ID',
    description: 'Retrieves a user by their unique identifier'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User found',
    type: UserDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User not found'
  })
  async getUser(@Param('id') id: string) {
    // ...
  }
}
```

**For DTOs:**

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ 
    description: 'User email address',
    example: 'user@example.com'
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ 
    description: 'User display name',
    example: 'John Doe'
  })
  @IsString()
  name?: string;
}
```

**Authentication:**

For protected endpoints:

```typescript
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Get('profile')
async getProfile() {
  // ...
}
```

## Testing

### Unit Tests

Located in `*.spec.ts` files alongside source code.

**Running tests:**
```bash
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm run test:cov            # With coverage
```

**Writing tests:**

```typescript
import { Test } from '@nestjs/testing';
import { CoursesService } from './courses.service';

describe('CoursesService', () => {
  let service: CoursesService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [CoursesService],
    }).compile();

    service = module.get<CoursesService>(CoursesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a course', () => {
    const course = service.create({
      name: 'Test Course',
      description: 'Test Description',
      credits: 3,
      prerequisites: [],
    });

    expect(course).toBeDefined();
    expect(course.name).toBe('Test Course');
  });
});
```

### Integration Tests

Located in `test/*.e2e-spec.ts`.

**Running tests:**
```bash
npm run test:e2e
```

### Load Testing

See [LOAD_TESTING.md](../LOAD_TESTING.md) for comprehensive load testing guide.

**Quick start:**
```bash
# Start the application
npm run start:prod

# Run load tests
npm run load:test          # API endpoints
npm run load:test:mixed    # Mixed workload
```

## Code Quality

### Linting

We use ESLint with TypeScript support.

**Configuration:** `eslint.config.js`

**Running linter:**
```bash
npm run lint              # Lint and auto-fix
npm run lint:check        # Lint without auto-fix
```

**VSCode Integration:**

Install the ESLint extension and add to `.vscode/settings.json`:

```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": [
    "javascript",
    "typescript"
  ]
}
```

### Formatting

We use Prettier for code formatting.

**Configuration:** `.prettierrc.json`

**Running formatter:**
```bash
npm run format
```

**VSCode Integration:**

Install the Prettier extension and add to `.vscode/settings.json`:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true
}
```

### Type Safety

Always use TypeScript strictly:

```typescript
// Bad
const data: any = fetchData();

// Good
interface User {
  id: string;
  name: string;
}

const data: User = fetchData();
```

### Code Review Checklist

Before submitting a PR:

- [ ] Code builds without errors
- [ ] All tests pass
- [ ] Linter passes
- [ ] No console.log statements
- [ ] Types are properly defined
- [ ] Error handling is implemented
- [ ] API documentation is updated
- [ ] Tests are added for new features
- [ ] Security considerations addressed
- [ ] Performance impact considered

## CI/CD Pipeline

### GitHub Actions

We use GitHub Actions for CI/CD. Workflows are in `.github/workflows/`.

#### CI Workflow (`ci.yml`)

Runs on every push and PR:
1. Install dependencies
2. Lint code
3. Run tests
4. Build project

#### Security Scan (`security-scan.yml`)

Runs weekly and on PR:
1. NPM audit
2. Dependency review
3. Trivy scan
4. Snyk scan (if configured)
5. CodeQL analysis

### Local Testing Before Push

```bash
# Run all checks locally
npm run lint:check
npm test
npm run build
```

### Pre-commit Hooks

Consider using Husky for pre-commit hooks:

```bash
npm install --save-dev husky
npx husky install
npx husky add .husky/pre-commit "npm run lint && npm test"
```

## Best Practices

### Code Organization

1. **Module Structure:**
   ```
   module/
   ├── dto/
   │   ├── create-*.dto.ts
   │   └── update-*.dto.ts
   ├── entities/
   │   └── *.entity.ts
   ├── *.controller.ts
   ├── *.service.ts
   ├── *.module.ts
   └── *.spec.ts
   ```

2. **Naming Conventions:**
   - Files: `kebab-case.ts`
   - Classes: `PascalCase`
   - Interfaces: `PascalCase`
   - Functions: `camelCase`
   - Constants: `UPPER_SNAKE_CASE`

### Error Handling

Always use proper error handling:

```typescript
import { HttpException, HttpStatus } from '@nestjs/common';

// Throw specific errors
throw new HttpException('User not found', HttpStatus.NOT_FOUND);

// Use try-catch for async operations
try {
  const result = await this.someService.riskyOperation();
  return result;
} catch (error) {
  logger.error({ err: error }, 'Operation failed');
  throw new HttpException(
    'Operation failed',
    HttpStatus.INTERNAL_SERVER_ERROR
  );
}
```

### Logging

Use structured logging with Pino:

```typescript
import logger from './config/logger';

// Good
logger.info({ userId: user.id, action: 'login' }, 'User logged in');

// Bad
logger.info(`User ${user.email} logged in`);

// Never log sensitive data
// BAD: logger.info({ password: user.password }, 'User data');
```

### Dependency Injection

Leverage NestJS dependency injection:

```typescript
@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  async findOne(id: string): Promise<User> {
    // Check cache first
    const cached = await this.cache.get<User>(`user:${id}`);
    if (cached) return cached;

    // Fetch from database
    const user = await this.prisma.user.findUnique({ where: { id } });
    
    // Cache result
    await this.cache.set(`user:${id}`, user, 300); // 5 minutes
    
    return user;
  }
}
```

### Environment Configuration

Never hardcode configuration:

```typescript
// Bad
const apiKey = 'abc123';

// Good
const apiKey = process.env.API_KEY;

// Better
@Injectable()
export class AppConfig {
  constructor(private configService: ConfigService) {}

  get apiKey(): string {
    return this.configService.get<string>('API_KEY');
  }
}
```

### Performance

1. **Use Caching:**
   ```typescript
   // Cache expensive operations
   const result = await this.cache.getOrSet(
     'expensive-operation',
     () => this.expensiveOperation(),
     3600 // 1 hour
   );
   ```

2. **Optimize Database Queries:**
   ```typescript
   // Bad - N+1 problem
   const users = await prisma.user.findMany();
   for (const user of users) {
     user.posts = await prisma.post.findMany({ where: { userId: user.id } });
   }

   // Good - Include related data
   const users = await prisma.user.findMany({
     include: { posts: true }
   });
   ```

3. **Use Pagination:**
   ```typescript
   async findAll(page: number = 1, limit: number = 10) {
     const skip = (page - 1) * limit;
     return this.prisma.user.findMany({
       skip,
       take: limit,
     });
   }
   ```

## Troubleshooting

### Common Issues

**Port Already in Use:**
```bash
# Find process using port 4000
lsof -i :4000

# Kill the process
kill -9 <PID>
```

**Node Modules Issues:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

**Build Errors:**
```bash
# Clean build
rm -rf dist
npm run build
```

### Getting Help

1. Check existing documentation
2. Search closed issues on GitHub
3. Ask in team chat
4. Create a GitHub issue with:
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Environment details

## Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Project README](../README.md)
- [API Documentation](http://localhost:4000/api/docs)

---

**Last Updated:** December 2024  
**Maintained by:** Quemiai Development Team
