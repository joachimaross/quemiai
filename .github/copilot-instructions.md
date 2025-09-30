# GitHub Copilot Instructions for Quemiai

This document provides guidelines for GitHub Copilot when generating code suggestions for the Quemiai project.

## Project Overview

Quemiai is a NestJS-based backend platform for scalable AI-driven applications built with TypeScript, WebSockets, and modern cloud infrastructure. Key technologies include:

- **Framework:** NestJS
- **Language:** TypeScript
- **Real-time:** Socket.IO (WebSockets)
- **Database:** PostgreSQL with Prisma ORM
- **Caching:** Redis
- **Testing:** Jest
- **Linting:** ESLint + Prettier
- **Logging:** Pino
- **Cloud:** Google Cloud Platform, Firebase
- **Deployment:** Vercel, Docker

## Code Style and Conventions

### TypeScript Standards

- Use TypeScript for all new code
- Enable strict type checking
- Avoid `any` type - use proper type definitions or `unknown` with type guards
- Use interfaces for object shapes, types for unions/primitives
- Prefer `const` over `let`, avoid `var`
- Use arrow functions for callbacks and class methods

### NestJS Conventions

- Use decorators (@Injectable(), @Controller(), @Get(), etc.)
- Follow NestJS module structure: controllers, services, providers
- Use dependency injection for all dependencies
- Keep controllers thin - business logic belongs in services
- Use DTOs (Data Transfer Objects) for request validation
- Use Pipes for validation and transformation

### File Organization

```
src/
├── api/                # API route handlers
├── config/             # Configuration files (logger, redis, firebase, etc.)
├── modules/            # Feature modules
│   └── chat/           # Real-time chat module with WebSocket gateway
├── middleware/         # Custom middleware (error handling, validation)
├── services/           # Business logic services
├── gateways/           # WebSocket gateways
├── utils/              # Utility functions
├── app.module.ts       # Root application module
└── main.ts             # Application entry point
```

### Naming Conventions

- **Files:** kebab-case (e.g., `user.controller.ts`, `auth.service.ts`)
- **Classes:** PascalCase (e.g., `UserController`, `AuthService`)
- **Interfaces:** PascalCase with 'I' prefix optional (e.g., `User` or `IUser`)
- **Variables/Functions:** camelCase (e.g., `userId`, `getUserById`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `MAX_RETRY_COUNT`)
- **Types:** PascalCase (e.g., `UserRole`, `ApiResponse`)

### Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- **feat:** New feature
- **fix:** Bug fix
- **docs:** Documentation changes
- **style:** Code style changes (formatting, etc.)
- **refactor:** Code refactoring
- **test:** Adding or updating tests
- **chore:** Maintenance tasks
- **perf:** Performance improvements

Examples:
```bash
git commit -m "feat: add user authentication module"
git commit -m "fix: resolve login timeout issue"
git commit -m "docs: update API documentation"
git commit -m "refactor: simplify chat gateway logic"
```

## Testing Requirements

### Test Coverage Goals

- **Overall:** 70%+ coverage
- **Critical paths:** 100% coverage (authentication, payment processing, security)
- **Controllers:** 80%+
- **Services:** 80%+
- **Utilities:** 100%

### Testing Best Practices

1. **Test Isolation:** Each test should be independent
2. **Clear Test Names:** Use descriptive names like `'should return 404 when user is not found'`
3. **Arrange-Act-Assert:** Structure tests clearly
4. **Mock External Dependencies:** Use Jest mocks for external services
5. **Test Edge Cases:** Null/undefined inputs, boundary values, error conditions

### Test Types

- **Unit Tests:** `src/**/*.spec.ts` - Test individual functions/classes
- **Integration Tests:** `test/**/*.spec.ts` - Test multiple components together
- **E2E Tests:** `test/**/*.e2e-spec.ts` - Test full API endpoints

### Running Tests

```bash
npm run test           # Run all tests
npm run test:watch     # Run tests in watch mode
npm run test:cov       # Run tests with coverage
npm run test:e2e       # Run e2e tests
```

## Code Quality

### Linting and Formatting

- ESLint for code quality
- Prettier for code formatting
- Run linter before committing: `npm run lint`
- Format code: `npm run format`
- CI will automatically check linting on PRs

### Error Handling

- Use NestJS exception filters for consistent error responses
- Create custom exceptions extending HttpException
- Log errors with structured logging (Pino)
- Don't expose sensitive information in error messages
- Validate all inputs with class-validator

### Security Best Practices

- Validate and sanitize all user inputs
- Use helmet for security headers
- Configure CORS properly
- Store secrets in environment variables (never in code)
- Use JWT for authentication
- Implement rate limiting for API endpoints
- Use prepared statements/ORM to prevent SQL injection

## Git Workflow

### Branch Strategy

- **main** - Production-ready code
- **dev** - Development/staging branch
- **feature/** - New features (e.g., `feature/user-auth`)
- **bugfix/** - Bug fixes (e.g., `bugfix/login-timeout`)
- **hotfix/** - Urgent production fixes (e.g., `hotfix/security-patch`)

### Workflow Steps

1. Create feature branch from `dev`: `git checkout -b feature/your-feature`
2. Make changes and commit frequently with conventional commit messages
3. Keep branch updated: `git rebase origin/dev`
4. Push and create Pull Request to `dev`
5. Ensure CI passes (linting, tests, build)
6. Get at least one peer review
7. Squash and merge when approved

### Pull Request Guidelines

- Use descriptive PR title: `feat: add real-time chat functionality`
- Fill out PR template completely
- Link related issues
- Ensure all CI checks pass
- Request review from team members
- Address all review comments
- Keep PRs small and focused (< 400 lines if possible)

## Environment and Configuration

### Environment Variables

- Use `.env` file for local development
- Copy `.env.example` to create your `.env`
- Never commit `.env` files to git
- Required variables:
  - `PORT` - Server port (default: 4000)
  - `DATABASE_URL` - PostgreSQL connection string
  - `JWT_SECRET` - Secret for JWT tokens
  - `REDIS_URL` - Redis connection (optional)
  - OAuth credentials (Google, Apple)
  - Firebase credentials
  - Cloud storage credentials

### Build and Deployment

```bash
npm run build          # Build TypeScript to JavaScript
npm run start:dev      # Development with hot reload
npm run start:prod     # Production mode
docker build -t quemiai .  # Build Docker image
```

## API Development

### REST API Guidelines

- Use proper HTTP methods (GET, POST, PUT, PATCH, DELETE)
- Use meaningful endpoint names: `/api/users`, `/api/chat/messages`
- Return appropriate status codes (200, 201, 400, 401, 404, 500)
- Use DTOs for request/response validation
- Document endpoints with Swagger decorators
- Implement pagination for list endpoints
- Use query parameters for filtering and sorting

### WebSocket Guidelines

- Use Socket.IO for real-time communication
- Implement proper event handlers
- Handle connection/disconnection events
- Validate all incoming socket messages
- Implement error handling for socket events
- Use rooms for multi-user communication

## Performance

- Use Redis caching for frequently accessed data
- Optimize database queries (use indexes, avoid N+1 queries)
- Implement rate limiting to prevent abuse
- Use connection pooling for database
- Log performance metrics for monitoring
- Implement health check endpoints (`/health`, `/ready`)

## Documentation

- Keep README.md up to date
- Document complex logic with code comments
- Update API documentation when adding endpoints
- Maintain changelog for significant changes
- Document environment variables in `.env.example`
- Keep CONTRIBUTING.md, GIT_WORKFLOW.md, and TESTING.md current

## Common Patterns

### Controller Pattern

```typescript
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    return this.userService.findOne(id);
  }
}
```

### Service Pattern

```typescript
@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: Logger,
  ) {}

  async findAll(): Promise<User[]> {
    try {
      return await this.prisma.user.findMany();
    } catch (error) {
      this.logger.error('Failed to fetch users', error);
      throw new InternalServerErrorException('Failed to fetch users');
    }
  }
}
```

### DTO Pattern

```typescript
import { IsString, IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;
}
```

## Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Jest Testing Framework](https://jestjs.io/)
- Project Documentation:
  - [CONTRIBUTING.md](../CONTRIBUTING.md) - Contribution guidelines
  - [GIT_WORKFLOW.md](../GIT_WORKFLOW.md) - Git workflow details
  - [TESTING.md](../TESTING.md) - Testing guide
  - [DEPLOYMENT.md](../DEPLOYMENT.md) - Deployment instructions
  - [ROADMAP.md](../ROADMAP.md) - Project roadmap

## When Generating Code

1. Follow the established patterns in the codebase
2. Use TypeScript with proper type definitions
3. Include appropriate error handling
4. Add validation for inputs
5. Write tests for new functionality
6. Follow the project's code style
7. Add logging for important operations
8. Consider security implications
9. Keep code DRY (Don't Repeat Yourself)
10. Write self-documenting code with clear variable/function names

## Node Version

- Supported: Node.js >= 18 < 21
- Check version compatibility for new dependencies

---

**Last Updated:** 2024
**Maintained by:** Quemiai Team
