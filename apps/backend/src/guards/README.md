# Authorization Guards

This directory contains centralized authentication and authorization guards for the Quemiai backend.

## Available Guards

### 1. JwtAuthGuard

Validates JWT tokens and attaches the decoded user to the request.

**Usage:**
```typescript
@UseGuards(JwtAuthGuard)
@Get('profile')
async getProfile(@Request() req) {
  return req.user;
}
```

### 2. RolesGuard

Implements Role-Based Access Control (RBAC). Checks if user has required role(s).

**Usage:**
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'moderator')
@Get('admin/users')
async getUsers() {
  // Only admins and moderators can access
}
```

### 3. OwnershipGuard

Ensures users can only access their own resources or requires admin privileges.

**Usage:**
```typescript
@UseGuards(JwtAuthGuard, OwnershipGuard)
@Get('users/:userId/posts')
async getUserPosts(@Param('userId') userId: string) {
  // Only the user or admin can access
}
```

## Available Roles

- `user`: Standard user (default)
- `moderator`: Content moderation capabilities
- `admin`: Full system access

## Guard Composition

Guards can be combined for layered security:

```typescript
@UseGuards(JwtAuthGuard, RolesGuard, OwnershipGuard)
@Roles('admin', 'moderator')
@Patch('posts/:id')
async updatePost(@Param('id') id: string, @Body() data: UpdatePostDto) {
  // Must be authenticated, have admin/moderator role, and own the resource
}
```

## Adding User Roles to JWT Payload

Update your authentication service to include roles in the JWT token:

```typescript
async login(user: User) {
  const payload = { 
    sub: user.id, 
    email: user.email,
    roles: user.roles || ['user'], // Add roles here
  };
  
  return {
    access_token: this.jwtService.sign(payload),
  };
}
```

## Database Schema

Add roles to your User model:

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String
  roles     String[] @default(["user"]) // Add this field
  // ... other fields
}
```

Or use an enum:

```prisma
enum UserRole {
  USER
  MODERATOR
  ADMIN
}

model User {
  id        String     @id @default(uuid())
  email     String     @unique
  password  String
  name      String
  role      UserRole   @default(USER)
  // ... other fields
}
```

## Testing Guards

See `__tests__/guards.test.ts` for examples of testing authorization guards.
