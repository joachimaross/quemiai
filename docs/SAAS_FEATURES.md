# SaaS Product Features Plan

This document outlines the roadmap for transforming Quemiai into a comprehensive SaaS platform with enterprise-grade features.

## Table of Contents

- [Multi-Tenancy](#multi-tenancy)
- [Enhanced Messaging](#enhanced-messaging)
- [Enterprise Features](#enterprise-features)
- [Billing Integration](#billing-integration)
- [Admin Dashboard](#admin-dashboard)
- [Implementation Timeline](#implementation-timeline)

## Multi-Tenancy

### Overview

Multi-tenancy allows multiple organizations to use the platform while keeping their data isolated and secure.

### Architecture Patterns

#### 1. Shared Database, Shared Schema

**Structure:**
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    UNIQUE(tenant_id, email)
);

CREATE TABLE tenants (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) UNIQUE,
    plan VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Pros:**
- Cost-effective
- Easy to maintain
- Simple backup/restore

**Cons:**
- Risk of data leakage
- Complex queries with tenant filtering
- Scaling limitations

#### 2. Shared Database, Separate Schemas

**Structure:**
```sql
-- Schema per tenant
CREATE SCHEMA tenant_abc123;
CREATE TABLE tenant_abc123.users (...);

CREATE SCHEMA tenant_def456;
CREATE TABLE tenant_def456.users (...);
```

**Pros:**
- Better data isolation
- Can grant schema-level permissions
- Easier to backup individual tenants

**Cons:**
- More complex migrations
- Schema management overhead

#### 3. Separate Databases

**Structure:**
```
tenant_abc123_db → users, messages, etc.
tenant_def456_db → users, messages, etc.
```

**Pros:**
- Complete data isolation
- Can scale tenants independently
- Different database versions possible

**Cons:**
- Expensive
- Complex management
- Harder to query across tenants

### Recommended Approach

**Hybrid Model:**
- Shared schema for small/medium tenants
- Separate database for enterprise tenants
- Tenant ID in every table
- Row-level security policies

### Implementation

**Tenant Context Middleware:**
```typescript
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Extract tenant from subdomain or header
    const subdomain = this.extractSubdomain(req);
    const tenant = await this.tenantService.findBySubdomain(subdomain);
    
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }
    
    req['tenant'] = tenant;
    next();
  }
  
  private extractSubdomain(req: Request): string {
    const host = req.hostname;
    // abc.quemiai.com → abc
    return host.split('.')[0];
  }
}
```

**Tenant Guard:**
```typescript
@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const tenant = request['tenant'];
    const user = request['user'];
    
    // Verify user belongs to tenant
    return user.tenantId === tenant.id;
  }
}
```

**Data Access with Tenant Filtering:**
```typescript
@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    @Inject(REQUEST) private request: Request,
  ) {}
  
  async findAll(): Promise<User[]> {
    const tenantId = this.request['tenant'].id;
    
    return this.prisma.user.findMany({
      where: { tenantId }
    });
  }
}
```

### Tenant Onboarding

**Sign-up Flow:**
1. User creates account
2. Choose subdomain (e.g., acme.quemiai.com)
3. Select plan (free/pro/enterprise)
4. Create workspace
5. Invite team members
6. Configure settings

**Provisioning:**
```typescript
async createTenant(data: CreateTenantDto): Promise<Tenant> {
  // Create tenant
  const tenant = await this.prisma.tenant.create({
    data: {
      name: data.companyName,
      subdomain: data.subdomain,
      plan: 'free',
    }
  });
  
  // Create admin user
  const admin = await this.usersService.create({
    email: data.adminEmail,
    tenantId: tenant.id,
    role: 'admin',
  });
  
  // Initialize tenant settings
  await this.settingsService.initializeDefaults(tenant.id);
  
  // Send welcome email
  await this.emailService.sendWelcome(admin.email);
  
  return tenant;
}
```

## Enhanced Messaging

### Advanced Features

#### Typing Indicators

**Implementation:**
```typescript
@WebSocketGateway()
export class ChatGateway {
  @SubscribeMessage('typing:start')
  handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string }
  ) {
    // Broadcast to conversation participants
    client.to(data.conversationId).emit('user:typing', {
      userId: client.data.userId,
      conversationId: data.conversationId,
    });
    
    // Auto-stop after 3 seconds
    setTimeout(() => {
      this.handleTypingStop(client, data);
    }, 3000);
  }
  
  @SubscribeMessage('typing:stop')
  handleTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string }
  ) {
    client.to(data.conversationId).emit('user:stopped-typing', {
      userId: client.data.userId,
      conversationId: data.conversationId,
    });
  }
}
```

#### Message Reactions

**Database Schema:**
```sql
CREATE TABLE message_reactions (
    id UUID PRIMARY KEY,
    message_id UUID NOT NULL REFERENCES messages(id),
    user_id UUID NOT NULL REFERENCES users(id),
    emoji VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(message_id, user_id, emoji)
);
```

**API Endpoint:**
```typescript
@Post('messages/:messageId/reactions')
async addReaction(
  @Param('messageId') messageId: string,
  @Body() data: { emoji: string }
) {
  return this.chatService.addReaction(messageId, data.emoji);
}
```

#### File Sharing

**Architecture:**
```
User → Upload → API → S3/GCS
                 ↓
         Create File Record
                 ↓
         Generate Signed URL
                 ↓
         Send Message with File
```

**Implementation:**
```typescript
@Post('messages/files')
@UseInterceptors(FileInterceptor('file'))
async uploadFile(
  @UploadedFile() file: Express.Multer.File,
  @Body() data: { conversationId: string }
) {
  // Upload to cloud storage
  const fileUrl = await this.storageService.upload(file);
  
  // Create file record
  const fileRecord = await this.filesService.create({
    name: file.originalname,
    url: fileUrl,
    mimeType: file.mimetype,
    size: file.size,
    uploadedBy: req.user.id,
  });
  
  // Send message with file attachment
  const message = await this.chatService.sendMessage({
    conversationId: data.conversationId,
    userId: req.user.id,
    type: 'file',
    fileId: fileRecord.id,
  });
  
  return message;
}
```

#### Voice Messages

**Recording Flow:**
1. User records audio in browser
2. Convert to MP3/OGG format
3. Upload to cloud storage
4. Generate waveform visualization
5. Send message with audio attachment

**Waveform Generation:**
```typescript
import * as ffmpeg from 'fluent-ffmpeg';

async generateWaveform(audioPath: string): Promise<number[]> {
  // Extract audio samples
  const samples = await this.extractAudioSamples(audioPath);
  
  // Downsample for visualization
  const waveform = this.downsample(samples, 100);
  
  return waveform;
}
```

## Enterprise Features

### Audit Logs

**What to Log:**
- User authentication (login/logout)
- Data access (read/write/delete)
- Configuration changes
- Permission changes
- API calls
- Failed operations

**Database Schema:**
```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    user_id UUID,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id VARCHAR(255),
    old_value JSONB,
    new_value JSONB,
    ip_address INET,
    user_agent TEXT,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_tenant ON audit_logs(tenant_id, created_at DESC);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
```

**Implementation:**
```typescript
@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private auditService: AuditLogService) {}
  
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const startTime = Date.now();
    
    return next.handle().pipe(
      tap(
        (data) => {
          this.auditService.log({
            tenantId: request.tenant?.id,
            userId: request.user?.id,
            action: `${request.method} ${request.url}`,
            resourceType: this.getResourceType(request),
            resourceId: request.params?.id,
            newValue: data,
            ipAddress: request.ip,
            userAgent: request.headers['user-agent'],
            status: 'success',
            duration: Date.now() - startTime,
          });
        },
        (error) => {
          this.auditService.log({
            tenantId: request.tenant?.id,
            userId: request.user?.id,
            action: `${request.method} ${request.url}`,
            status: 'error',
            error: error.message,
          });
        }
      )
    );
  }
}
```

### Data Export/Import

**Export Formats:**
- JSON (full data)
- CSV (tabular data)
- PDF (reports)
- SQL (database dump)

**Export API:**
```typescript
@Post('export')
async export(@Body() data: ExportDto) {
  const job = await this.queueService.add('export', {
    tenantId: data.tenantId,
    format: data.format,
    entities: data.entities,
  });
  
  return { jobId: job.id };
}

@Get('export/:jobId')
async getExportStatus(@Param('jobId') jobId: string) {
  const job = await this.queueService.getJob(jobId);
  
  if (job.isCompleted) {
    return {
      status: 'completed',
      downloadUrl: job.data.url,
      expiresAt: job.data.expiresAt,
    };
  }
  
  return {
    status: 'processing',
    progress: job.progress,
  };
}
```

**Import Validation:**
```typescript
async validateImport(file: Express.Multer.File): Promise<ValidationResult> {
  const data = await this.parseFile(file);
  const errors: ValidationError[] = [];
  
  for (const row of data) {
    // Validate schema
    const schemaErrors = this.validateSchema(row);
    errors.push(...schemaErrors);
    
    // Validate business rules
    const businessErrors = await this.validateBusinessRules(row);
    errors.push(...businessErrors);
  }
  
  return {
    valid: errors.length === 0,
    errors,
    rowCount: data.length,
  };
}
```

### Single Sign-On (SSO)

**Supported Protocols:**
- SAML 2.0
- OAuth 2.0
- OpenID Connect (OIDC)

**Implementation:**
```typescript
@Injectable()
export class SamlStrategy extends PassportStrategy(Strategy, 'saml') {
  constructor(
    private configService: ConfigService,
    private tenantService: TenantService,
  ) {
    super({
      entryPoint: configService.get('SAML_ENTRY_POINT'),
      issuer: configService.get('SAML_ISSUER'),
      callbackUrl: configService.get('SAML_CALLBACK_URL'),
      cert: configService.get('SAML_CERT'),
    });
  }
  
  async validate(profile: any): Promise<User> {
    // Find or create user based on SAML profile
    const user = await this.userService.findOrCreate({
      email: profile.email,
      name: profile.displayName,
      ssoProvider: 'saml',
      ssoId: profile.nameID,
    });
    
    return user;
  }
}
```

## Billing Integration

### Stripe Integration

**Subscription Plans:**
```typescript
export enum Plan {
  FREE = 'free',
  PRO = 'pro',
  ENTERPRISE = 'enterprise',
}

export const PLAN_PRICES = {
  [Plan.FREE]: {
    price: 0,
    features: ['5 users', '1GB storage', 'Basic support'],
  },
  [Plan.PRO]: {
    price: 29,
    priceId: 'price_pro_monthly',
    features: ['Unlimited users', '100GB storage', 'Priority support'],
  },
  [Plan.ENTERPRISE]: {
    price: 99,
    priceId: 'price_enterprise_monthly',
    features: ['Unlimited users', 'Unlimited storage', 'Dedicated support'],
  },
};
```

**Subscription Management:**
```typescript
@Injectable()
export class BillingService {
  constructor(private stripe: Stripe) {}
  
  async createSubscription(
    tenantId: string,
    plan: Plan,
    paymentMethodId: string
  ): Promise<Subscription> {
    // Create Stripe customer
    const customer = await this.stripe.customers.create({
      payment_method: paymentMethodId,
      email: tenant.adminEmail,
      metadata: { tenantId },
    });
    
    // Create subscription
    const subscription = await this.stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: PLAN_PRICES[plan].priceId }],
      expand: ['latest_invoice.payment_intent'],
    });
    
    // Update tenant
    await this.tenantService.update(tenantId, {
      plan,
      stripeCustomerId: customer.id,
      stripeSubscriptionId: subscription.id,
    });
    
    return subscription;
  }
  
  async handleWebhook(event: Stripe.Event) {
    switch (event.type) {
      case 'invoice.payment_succeeded':
        await this.handlePaymentSuccess(event.data.object);
        break;
      case 'invoice.payment_failed':
        await this.handlePaymentFailure(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionCanceled(event.data.object);
        break;
    }
  }
}
```

**Usage-Based Billing:**
```typescript
async trackUsage(tenantId: string, metric: string, quantity: number) {
  // Record usage
  await this.usageService.record({
    tenantId,
    metric, // e.g., 'api_calls', 'storage_gb', 'messages_sent'
    quantity,
    timestamp: new Date(),
  });
  
  // Report to Stripe
  const tenant = await this.tenantService.findById(tenantId);
  if (tenant.stripeSubscriptionId) {
    await this.stripe.subscriptionItems.createUsageRecord(
      tenant.stripeSubscriptionItemId,
      { quantity }
    );
  }
}
```

## Admin Dashboard

### Features

**Dashboard Overview:**
- Active users
- Total revenue
- System health
- Recent activity
- Support tickets

**User Management:**
- Search and filter users
- View user details
- Suspend/activate users
- Reset passwords
- View user activity

**Tenant Management:**
- List all tenants
- View tenant details
- Manage subscriptions
- View usage metrics
- Support tickets per tenant

**Analytics:**
- User growth
- Revenue trends
- Feature usage
- Performance metrics
- Error rates

**System Administration:**
- Feature flags
- System configuration
- Background jobs
- Database maintenance
- Cache management

### Implementation

**Admin Authentication:**
```typescript
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    return user.role === 'super_admin';
  }
}
```

**Analytics API:**
```typescript
@Controller('admin/analytics')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminAnalyticsController {
  @Get('overview')
  async getOverview(@Query() query: DateRangeDto) {
    return {
      activeUsers: await this.analyticsService.getActiveUsers(query),
      revenue: await this.billingService.getRevenue(query),
      signups: await this.analyticsService.getSignups(query),
      churnRate: await this.analyticsService.getChurnRate(query),
    };
  }
  
  @Get('users/growth')
  async getUserGrowth(@Query() query: DateRangeDto) {
    return this.analyticsService.getUserGrowth(query);
  }
}
```

## Implementation Timeline

### Q1 2025: Foundation
- [ ] Multi-tenancy architecture
- [ ] Tenant onboarding flow
- [ ] Basic billing integration
- [ ] Stripe subscription management

### Q2 2025: Enhanced Messaging
- [ ] Typing indicators
- [ ] Message reactions
- [ ] File sharing (images, documents)
- [ ] Voice messages

### Q3 2025: Enterprise Features
- [ ] Audit logging
- [ ] Data export/import
- [ ] SSO integration (SAML, OIDC)
- [ ] Advanced RBAC

### Q4 2025: Admin & Analytics
- [ ] Admin dashboard
- [ ] Analytics and reporting
- [ ] Usage-based billing
- [ ] Enterprise support tools

## Success Metrics

- [ ] Multi-tenant isolation verified
- [ ] 99.9% billing accuracy
- [ ] < 5 second file upload
- [ ] < 100ms messaging latency
- [ ] Audit logs for all critical operations
- [ ] SSO working for major providers
- [ ] Admin dashboard response time < 2s
- [ ] Data export time < 5 minutes

---

**Last Updated:** December 2024  
**Maintained by:** Quemiai Product Team
