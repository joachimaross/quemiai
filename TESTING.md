# Testing Guide

This guide covers testing strategies, best practices, and coverage goals for the Quemiai backend application.

## Table of Contents

- [Testing Philosophy](#testing-philosophy)
- [Test Types](#test-types)
- [Running Tests](#running-tests)
- [Coverage Goals](#coverage-goals)
- [Writing Tests](#writing-tests)
- [Best Practices](#best-practices)
- [Continuous Integration](#continuous-integration)

## Testing Philosophy

We follow a test-driven development (TDD) approach where possible and maintain high test coverage to ensure:

- **Reliability:** Code works as expected
- **Maintainability:** Changes don't break existing functionality
- **Documentation:** Tests serve as living documentation
- **Confidence:** Safe refactoring and feature additions

## Test Types

### 1. Unit Tests

Unit tests verify individual functions, classes, and modules in isolation.

**Location:** `src/**/*.spec.ts` or `src/**/__tests__/*.test.ts`

**Example:**
```typescript
// src/utils/__tests__/math.test.ts
describe('Math Utils', () => {
  it('should add two numbers', () => {
    expect(add(2, 3)).toBe(5);
  });
});
```

**Coverage Target:** 80%+

### 2. Integration Tests

Integration tests verify that multiple components work together correctly.

**Location:** `src/**/__tests__/*.test.ts`

**Example:**
```typescript
// src/api/__tests__/auth.test.ts
describe('Auth API', () => {
  it('should authenticate user with valid credentials', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'test@example.com', password: 'password' });
    expect(response.status).toBe(200);
  });
});
```

**Coverage Target:** 70%+

### 3. End-to-End (E2E) Tests

E2E tests verify complete user workflows from end to end.

**Location:** `test/**/*.e2e-spec.ts`

**Example:**
```typescript
// test/app.e2e-spec.ts
describe('AppController (e2e)', () => {
  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200);
  });
});
```

**Coverage Target:** Critical user flows covered

### 4. WebSocket Tests

Test real-time functionality and WebSocket connections.

**Location:** `src/modules/**/gateway/*.spec.ts`

**Example:**
```typescript
describe('ChatGateway', () => {
  it('should handle message events', () => {
    // WebSocket test implementation
  });
});
```

**Coverage Target:** All WebSocket events covered

## Running Tests

### All Tests

```bash
npm run test
```

### Watch Mode (for development)

```bash
npm run test:watch
```

### With Coverage

```bash
npm run test:cov
```

### E2E Tests

```bash
npm run test:e2e
```

### Specific Test File

```bash
npm run test -- src/utils/__tests__/math.test.ts
```

### Debug Tests

```bash
npm run test:debug
```

Then attach your debugger to the Node.js process.

## Coverage Goals

### Overall Coverage Targets

| Metric | Current | Target | Stretch Goal |
|--------|---------|--------|--------------|
| **Statements** | ~42% | 75% | 85% |
| **Branches** | ~20% | 65% | 75% |
| **Functions** | ~15% | 70% | 80% |
| **Lines** | ~41% | 75% | 85% |

### Module-Specific Targets

#### High Priority (80%+ coverage)

- **Controllers:** All API endpoints
- **Services:** Core business logic
- **Utilities:** Helper functions
- **Middleware:** Authentication, validation, error handling

#### Medium Priority (70%+ coverage)

- **Gateways:** WebSocket handlers
- **Guards:** Authorization logic
- **Pipes:** Data transformation
- **Filters:** Exception handling

#### Lower Priority (50%+ coverage)

- **Configuration:** Config files
- **DTOs:** Data transfer objects
- **Entities:** Database models

### Critical Paths (100% coverage required)

- Authentication and authorization
- Payment processing (if applicable)
- Data validation and sanitization
- Error handling for security-critical operations

## Writing Tests

### Test Structure

Follow the AAA pattern: **Arrange, Act, Assert**

```typescript
describe('UserService', () => {
  describe('createUser', () => {
    it('should create a new user with valid data', async () => {
      // Arrange
      const userData = { email: 'test@example.com', name: 'Test User' };
      
      // Act
      const result = await userService.createUser(userData);
      
      // Assert
      expect(result).toBeDefined();
      expect(result.email).toBe(userData.email);
    });
  });
});
```

### Naming Conventions

- **Describe blocks:** Use noun phrases (e.g., "UserService", "createUser method")
- **Test cases:** Use "should" statements (e.g., "should return user data")
- **Test files:** Match source files with `.spec.ts` or `.test.ts` suffix

### Mocking

Use mocking to isolate units under test:

```typescript
const mockRepository = {
  findOne: jest.fn().mockResolvedValue(mockUser),
  save: jest.fn().mockResolvedValue(mockUser),
};
```

### Testing Async Code

Always use `async/await` or return promises:

```typescript
it('should handle async operations', async () => {
  const result = await someAsyncFunction();
  expect(result).toBeDefined();
});
```

## Best Practices

### 1. Test Isolation

- Each test should be independent
- Use `beforeEach` to set up clean state
- Don't rely on test execution order

### 2. Clear Test Names

```typescript
// ❌ Bad
it('test 1', () => { /* ... */ });

// ✅ Good
it('should return 404 when user is not found', () => { /* ... */ });
```

### 3. One Assertion Per Test (when possible)

```typescript
// ✅ Good - focused test
it('should return correct status code', () => {
  expect(response.status).toBe(200);
});

it('should return correct data structure', () => {
  expect(response.body).toHaveProperty('data');
});
```

### 4. Test Edge Cases

- Null/undefined inputs
- Empty arrays/objects
- Boundary values
- Error conditions

### 5. Avoid Test Dependencies

Tests should not depend on external services. Use mocks or test doubles.

### 6. Keep Tests Fast

- Use in-memory databases for integration tests
- Mock external API calls
- Avoid unnecessary delays

### 7. Use Test Fixtures

Create reusable test data:

```typescript
// test/fixtures/users.ts
export const mockUser = {
  id: 1,
  email: 'test@example.com',
  name: 'Test User',
};
```

### 8. Test Error Conditions

```typescript
it('should throw error for invalid input', async () => {
  await expect(service.process(null)).rejects.toThrow();
});
```

## Test Coverage Improvement Plan

### Phase 1: Foundation (Short Term - 1-2 weeks)

- [ ] Add tests for all controllers (target: 80%)
- [ ] Add tests for authentication middleware (target: 90%)
- [ ] Add tests for validation logic (target: 85%)
- [ ] Set up test fixtures and mocks library

### Phase 2: Core Logic (Medium Term - 3-4 weeks)

- [ ] Add comprehensive service tests (target: 75%)
- [ ] Add integration tests for API endpoints (target: 70%)
- [ ] Add WebSocket gateway tests (target: 75%)
- [ ] Implement E2E tests for critical user flows

### Phase 3: Enhancement (Long Term - 2-3 months)

- [ ] Achieve 80%+ overall coverage
- [ ] Add performance tests for critical endpoints
- [ ] Add load testing scenarios
- [ ] Implement contract testing for external integrations
- [ ] Set up mutation testing

## Continuous Integration

### GitHub Actions

Tests run automatically on:

- Every push to feature branches
- Pull request creation/update
- Merge to main/dev branches

### Coverage Reports

Coverage reports are generated and can be viewed:

- In the CI logs
- As artifacts attached to workflow runs
- In coverage tools (if configured)

### Quality Gates

Pull requests require:

- [ ] All tests passing
- [ ] No decrease in coverage percentage
- [ ] Minimum 70% coverage for new code

## Tools and Frameworks

### Testing Framework

- **Jest:** Primary testing framework
- **ts-jest:** TypeScript support for Jest
- **Supertest:** HTTP assertions for API testing

### Utilities

- **@nestjs/testing:** NestJS testing utilities
- **jest-mock-extended:** Enhanced mocking capabilities

### Configuration

Test configuration is in `jest.config.cjs`:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  coverageDirectory: 'coverage',
};
```

## Troubleshooting

### Tests Timing Out

Increase timeout for specific tests:

```typescript
it('should handle long operation', async () => {
  // test code
}, 10000); // 10 second timeout
```

### Async Issues

Always handle promises properly:

```typescript
// ❌ Bad
it('test async', () => {
  someAsyncFunction(); // No await or return
});

// ✅ Good
it('test async', async () => {
  await someAsyncFunction();
});
```

### Mock Issues

Clear mocks between tests:

```typescript
beforeEach(() => {
  jest.clearAllMocks();
});
```

## Resources

- [Jest Documentation](https://jestjs.io/)
- [NestJS Testing Documentation](https://docs.nestjs.com/fundamentals/testing)
- [Testing Best Practices](https://testingjavascript.com/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)

## Contributing

When adding new features:

1. Write tests first (TDD approach when possible)
2. Ensure all tests pass
3. Verify coverage doesn't decrease
4. Update this guide if adding new testing patterns

---

**Remember:** Good tests are an investment in code quality and maintainability!
