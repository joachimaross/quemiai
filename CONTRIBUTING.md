# Contributing to Quemiai

First off, thank you for considering contributing to Quemiai! It's people like you that make Quemiai such a great platform.

## Table of Contents
1. [Code of Conduct](#code-of-conduct)
2. [How Can I Contribute?](#how-can-i-contribute)
3. [Development Setup](#development-setup)
4. [Commit Message Guidelines](#commit-message-guidelines)
5. [Pull Request Process](#pull-request-process)
6. [Coding Standards](#coding-standards)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce**
- **Expected vs. actual behavior**
- **Environment details** (OS, Node version, etc.)
- **Screenshots or logs** if applicable

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description** of the suggested enhancement
- **Explain why this enhancement would be useful**
- **List any alternatives** you've considered

### Your First Code Contribution

Unsure where to begin? Look for issues labeled:
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `bug` - Something isn't working

## Development Setup

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 15+
- Redis 7+
- Git

### Setup Steps

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/quemiai.git
   cd quemiai
   ```

2. **Install dependencies**
   ```bash
   npm install -g pnpm@8.15.0
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp apps/backend/.env.example apps/backend/.env
   cp apps/web/.env.local.example apps/web/.env.local
   # Edit .env files with your local configuration
   ```

4. **Set up database**
   ```bash
   cd apps/backend
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Run development servers**
   ```bash
   # Backend
   pnpm backend:dev
   
   # Web (in another terminal)
   pnpm web:dev
   ```

## Commit Message Guidelines

**We enforce Conventional Commits to maintain a clean and meaningful commit history.**

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Code style changes (formatting, missing semicolons, etc.)
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **build**: Build system changes
- **ci**: CI/CD changes
- **chore**: Other changes that don't modify src or test files
- **revert**: Revert a previous commit

### Scope (Optional)

The scope should specify the area of change:
- `auth`: Authentication related
- `api`: API endpoints
- `db`: Database related
- `ui`: User interface
- `docs`: Documentation
- `deps`: Dependencies

### Examples

```bash
feat(auth): add JWT refresh token support

Implements refresh token rotation to improve security.
Tokens expire after 7 days and can be refreshed.

Closes #123

fix(api): handle null values in user profile endpoint

The endpoint was throwing 500 errors when bio was null.
Now properly handles null values and returns empty string.

Fixes #456

docs(readme): update installation instructions

Added PostgreSQL setup steps and troubleshooting section.

chore(deps): update @nestjs/core to v11.0.1

Security patch for CVE-2024-12345
```

### Pre-commit Hooks

We use Husky to enforce commit message format:
- ✅ Conventional Commits format validation
- ✅ Secret scanning (prevents committing credentials)
- ✅ Linting on staged files

**If your commit is rejected:**
1. Check the error message
2. Ensure your commit message follows the format
3. Make sure no secrets are in staged files

## Pull Request Process

### Before Submitting

1. **Create a feature branch**
   ```bash
   git checkout -b feat/my-amazing-feature
   ```

2. **Write meaningful commits**
   - Follow Conventional Commits format
   - Keep commits atomic (one logical change per commit)
   - Write clear commit messages

3. **Test your changes**
   ```bash
   pnpm lint        # Run linter
   pnpm test        # Run tests
   pnpm build       # Ensure build succeeds
   ```

4. **Update documentation**
   - Update README if adding new features
   - Add JSDoc comments to new functions
   - Update API documentation if changing endpoints

### Submitting the PR

1. **Push to your fork**
   ```bash
   git push origin feat/my-amazing-feature
   ```

2. **Create Pull Request**
   - Use a clear title following Conventional Commits format
   - Fill out the PR template completely
   - Link related issues
   - Add screenshots for UI changes
   - Request review from maintainers

3. **PR Title Format**
   ```
   feat(auth): add social login support
   fix(api): resolve race condition in message sending
   docs(contributing): add PR guidelines
   ```

### PR Review Process

- Maintainers will review your PR within 2-3 business days
- Address review feedback promptly
- Keep PRs focused (one feature/fix per PR)
- Rebase on main if conflicts arise

### After Approval

- Squash commits if requested
- Ensure all CI checks pass
- Maintainers will merge your PR

## Coding Standards

### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow ESLint configuration
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Prefer `const` over `let`, avoid `var`
- Use async/await over callbacks
- Handle errors appropriately

### NestJS Backend

```typescript
// Good
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getUser(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<UserDto> {
    return this.usersService.findOne(id);
  }
}
```

### React/Next.js Frontend

```typescript
// Good
export const UserProfile: React.FC<UserProfileProps> = ({ userId }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser(userId).then(setUser).finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <LoadingSpinner />;
  if (!user) return <NotFound />;

  return <div>{user.name}</div>;
};
```

### Testing

- Write tests for new features
- Maintain test coverage above 75%
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

```typescript
describe('UsersService', () => {
  it('should create a new user with valid data', async () => {
    // Arrange
    const userData = { email: 'test@example.com', name: 'Test User' };

    // Act
    const user = await service.create(userData);

    // Assert
    expect(user).toBeDefined();
    expect(user.email).toBe(userData.email);
  });
});
```

### File Structure

```
apps/
  backend/
    src/
      modules/
        users/
          users.controller.ts
          users.service.ts
          users.module.ts
          dto/
          entities/
          tests/
```

### Documentation

- Add JSDoc comments to public functions
- Update API documentation when changing endpoints
- Keep README and guides up to date
- Include examples in documentation

```typescript
/**
 * Creates a new user with the provided data
 * @param userData - User registration data
 * @returns Created user object
 * @throws {ConflictException} If email already exists
 * @example
 * const user = await createUser({ email: 'test@example.com', name: 'Test' });
 */
async createUser(userData: CreateUserDto): Promise<User> {
  // Implementation
}
```

## Security

### Reporting Security Issues

**DO NOT** open public issues for security vulnerabilities. Instead:
1. Email security@quemiai.com (or maintainer directly)
2. Include detailed description and steps to reproduce
3. Wait for acknowledgment before disclosure

See [SECURITY.md](SECURITY.md) for our security policy.

### Security Best Practices

- Never commit secrets or credentials
- Use environment variables for configuration
- Validate and sanitize all user input
- Use parameterized queries (Prisma does this)
- Implement proper authentication and authorization
- Follow OWASP Top 10 guidelines

## Questions?

- Check existing [documentation](README.md)
- Search [existing issues](https://github.com/joachimaross/quemiai/issues)
- Ask in [discussions](https://github.com/joachimaross/quemiai/discussions)
- Contact maintainers

---

## Attribution

This contributing guide is adapted from open-source contribution guidelines and best practices.

Thank you for contributing to Quemiai! 🎉
git rebase main
git push --force-with-lease origin 38-add-awesome-new-feature
```

Finally, go to GitHub and [make a Pull Request](https://github.com/joachimaross/JoachimaSocial/compare) :D

### Keeping your Pull Request updated

If a maintainer asks you to "rebase" your PR, they're saying that a lot of code has changed, and that you need to update your branch so it's easier to merge.

To learn more about rebasing and merge conflicts, check out this guide on [how to rebase a Pull Request](https://github.com/joachimaross/JoachimaSocial/blob/main/docs/REBASE.md).
