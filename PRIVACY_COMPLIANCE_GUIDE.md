# Data Privacy & Compliance Guide

This guide covers GDPR, CCPA, and other data privacy regulations compliance for the Quemiai platform.

## Table of Contents

- [Overview](#overview)
- [GDPR Compliance](#gdpr-compliance)
- [CCPA Compliance](#ccpa-compliance)
- [Data Subject Rights](#data-subject-rights)
- [Implementation](#implementation)
- [Audit Logging](#audit-logging)
- [Consent Management](#consent-management)

---

## Overview

Quemiai implements data privacy controls to comply with:
- **GDPR** (General Data Protection Regulation) - EU
- **CCPA** (California Consumer Privacy Act) - California, USA
- **Similar regulations** worldwide

### Key Principles

1. **Lawfulness, Fairness, and Transparency**: Process data legally and inform users
2. **Purpose Limitation**: Collect data only for specified purposes
3. **Data Minimization**: Collect only necessary data
4. **Accuracy**: Keep data accurate and up-to-date
5. **Storage Limitation**: Retain data only as long as necessary
6. **Integrity and Confidentiality**: Secure data from unauthorized access
7. **Accountability**: Demonstrate compliance

---

## GDPR Compliance

### Legal Basis for Processing

We process personal data under these legal bases:

1. **Consent**: User explicitly agrees (e.g., marketing emails)
2. **Contract**: Necessary to provide the service
3. **Legal Obligation**: Required by law
4. **Legitimate Interest**: Business needs that don't override user rights

### Data We Collect

| Data Category | Examples | Legal Basis | Retention |
|---------------|----------|-------------|-----------|
| Account Data | Email, username, password | Contract | Account lifetime |
| Profile Data | Name, avatar, bio | Contract | Account lifetime |
| Usage Data | Login times, features used | Legitimate Interest | 2 years |
| Communication | Messages, posts, comments | Contract | User-controlled |
| Technical Data | IP address, device info | Legitimate Interest | 90 days |
| Marketing Data | Email preferences | Consent | Until withdrawal |

### User Rights (GDPR Articles 15-22)

1. **Right to Access** (Art. 15): Users can request their data
2. **Right to Rectification** (Art. 16): Users can correct their data
3. **Right to Erasure** (Art. 17): "Right to be forgotten"
4. **Right to Restrict Processing** (Art. 18): Limit data use
5. **Right to Data Portability** (Art. 20): Export data in machine-readable format
6. **Right to Object** (Art. 21): Object to processing
7. **Automated Decision-Making** (Art. 22): Right to human review

---

## CCPA Compliance

### Consumer Rights

California residents have the right to:

1. **Know**: What personal information is collected
2. **Access**: Request their personal information
3. **Delete**: Request deletion of their data
4. **Opt-Out**: Opt-out of data sale (if applicable)
5. **Non-Discrimination**: Same service regardless of rights exercised

### "Do Not Sell My Personal Information"

While Quemiai does not sell personal information, we provide a mechanism to opt-out as required by CCPA.

---

## Data Subject Rights

### Right to Access (Data Export)

**Endpoint**: `GET /api/privacy/data-export`

Users can request a complete export of their data.

**Implementation**:

```typescript
@Controller('privacy')
export class PrivacyController {
  @Get('data-export')
  @UseGuards(AuthGuard)
  async exportUserData(@CurrentUser() user: User) {
    return {
      account: {
        id: user.id,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt,
      },
      profile: await this.getProfile(user.id),
      posts: await this.getPosts(user.id),
      comments: await this.getComments(user.id),
      messages: await this.getMessages(user.id),
      settings: await this.getSettings(user.id),
    };
  }
}
```

**Response Format**: JSON (machine-readable as per GDPR Art. 20)

### Right to Erasure (Data Deletion)

**Endpoint**: `DELETE /api/privacy/delete-account`

Users can request account and data deletion.

**Implementation**:

```typescript
@Delete('delete-account')
@UseGuards(AuthGuard)
async deleteAccount(
  @CurrentUser() user: User,
  @Body() dto: DeleteAccountDto,
) {
  // Verify identity (password or MFA)
  await this.verifyIdentity(user, dto.password);
  
  // Log deletion request
  await this.auditLog.log({
    userId: user.id,
    action: 'ACCOUNT_DELETION_REQUESTED',
    timestamp: new Date(),
  });
  
  // Execute deletion
  await this.deleteUserData(user.id);
  
  // Notify user
  await this.notifyDeletion(user.email);
  
  return { message: 'Account deleted successfully' };
}
```

**Deletion Process**:

1. **Immediate**: Remove personal identifiers
2. **30 Days**: Soft delete (recoverable)
3. **After 30 Days**: Hard delete (permanent)

**What Gets Deleted**:
- User profile and account data
- Posts, comments, and messages
- Uploaded files and media
- Analytics and tracking data
- Marketing preferences

**What Gets Retained** (Legal Obligations):
- Financial records (7 years)
- Fraud prevention data (as needed)
- Legal hold data (as required)

### Right to Rectification (Data Correction)

**Endpoint**: `PATCH /api/users/me`

Users can update their profile data anytime.

### Right to Data Portability

**Endpoint**: `GET /api/privacy/export-csv`

Export data in CSV format for portability.

### Right to Restrict Processing

**Endpoint**: `POST /api/privacy/restrict-processing`

Users can request limited processing of their data.

### Right to Object

**Endpoint**: `POST /api/privacy/object-processing`

Users can object to certain types of processing (e.g., marketing).

---

## Implementation

### Privacy Module

```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([User, AuditLog, Consent]),
  ],
  controllers: [PrivacyController],
  providers: [
    PrivacyService,
    DataDeletionService,
    ConsentService,
    AuditLogService,
  ],
  exports: [PrivacyService],
})
export class PrivacyModule {}
```

### Privacy Service

```typescript
@Injectable()
export class PrivacyService {
  async exportUserData(userId: string): Promise<UserDataExport> {
    // Aggregate all user data
    return {
      account: await this.getUserAccount(userId),
      profile: await this.getUserProfile(userId),
      activity: await this.getUserActivity(userId),
      preferences: await this.getUserPreferences(userId),
    };
  }
  
  async deleteUserData(userId: string): Promise<void> {
    // Start transaction
    await this.dataSource.transaction(async (manager) => {
      // Delete user content
      await manager.delete(Post, { userId });
      await manager.delete(Comment, { userId });
      await manager.delete(Message, { userId });
      
      // Anonymize references (GDPR allows keeping statistical data)
      await manager.update(Activity, { userId }, { userId: 'DELETED_USER' });
      
      // Delete personal data
      await manager.delete(UserProfile, { userId });
      await manager.delete(User, { id: userId });
    });
  }
  
  async anonymizeUser(userId: string): Promise<void> {
    // Alternative to deletion: anonymize
    await this.userRepository.update(userId, {
      email: `deleted_${userId}@anonymous.com`,
      username: `deleted_${userId}`,
      firstName: null,
      lastName: null,
      phoneNumber: null,
      isAnonymized: true,
    });
  }
}
```

---

## Audit Logging

All privacy-related actions must be logged for compliance.

### Audit Log Schema

```typescript
interface AuditLog {
  id: string;
  userId: string;
  action: AuditAction;
  resource: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}

enum AuditAction {
  ACCOUNT_CREATED = 'ACCOUNT_CREATED',
  ACCOUNT_DELETED = 'ACCOUNT_DELETED',
  DATA_EXPORTED = 'DATA_EXPORTED',
  DATA_ACCESSED = 'DATA_ACCESSED',
  CONSENT_GRANTED = 'CONSENT_GRANTED',
  CONSENT_WITHDRAWN = 'CONSENT_WITHDRAWN',
  PROCESSING_RESTRICTED = 'PROCESSING_RESTRICTED',
  PROCESSING_OBJECTED = 'PROCESSING_OBJECTED',
}
```

### Audit Service

```typescript
@Injectable()
export class AuditLogService {
  async log(entry: AuditLogEntry): Promise<void> {
    await this.auditLogRepository.insert({
      ...entry,
      timestamp: new Date(),
    });
  }
  
  async getUserAuditLog(userId: string): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { userId },
      order: { timestamp: 'DESC' },
    });
  }
}
```

### What to Log

- Account creation and deletion
- Data access and export requests
- Consent changes
- Privacy settings updates
- Data breach notifications (if applicable)

**Retention**: 7 years (varies by jurisdiction)

---

## Consent Management

### Consent Types

1. **Required**: Essential for service (implied consent)
2. **Functional**: Enhance user experience (explicit consent)
3. **Marketing**: Promotional communications (explicit consent)
4. **Analytics**: Usage tracking (explicit consent)
5. **Personalization**: Tailored content (explicit consent)

### Consent Schema

```typescript
interface Consent {
  id: string;
  userId: string;
  type: ConsentType;
  granted: boolean;
  timestamp: Date;
  ipAddress: string;
  version: string; // Terms version
}
```

### Consent Service

```typescript
@Injectable()
export class ConsentService {
  async grantConsent(
    userId: string,
    type: ConsentType,
    metadata: ConsentMetadata,
  ): Promise<void> {
    await this.consentRepository.insert({
      userId,
      type,
      granted: true,
      timestamp: new Date(),
      ipAddress: metadata.ipAddress,
      version: metadata.termsVersion,
    });
  }
  
  async withdrawConsent(userId: string, type: ConsentType): Promise<void> {
    await this.consentRepository.insert({
      userId,
      type,
      granted: false,
      timestamp: new Date(),
    });
  }
  
  async hasConsent(userId: string, type: ConsentType): Promise<boolean> {
    const consent = await this.consentRepository.findOne({
      where: { userId, type },
      order: { timestamp: 'DESC' },
    });
    
    return consent?.granted ?? false;
  }
}
```

### Consent Banner (Frontend)

```typescript
// Cookie consent banner
<ConsentBanner
  onAcceptAll={() => grantAllConsents()}
  onAcceptNecessary={() => grantEssentialOnly()}
  onCustomize={() => showConsentPreferences()}
/>

// Preference center
<ConsentPreferences
  consents={{
    functional: true,
    marketing: false,
    analytics: true,
  }}
  onChange={(consents) => updateConsents(consents)}
/>
```

---

## Privacy by Design

### Default Privacy Settings

- All marketing communications: **Opt-in** (explicit consent required)
- Analytics tracking: **Opt-in**
- Profile visibility: **Private** by default
- Data sharing: **Disabled** by default

### Data Minimization

Only collect data necessary for the service:

```typescript
// ❌ Bad: Collecting unnecessary data
interface UserProfile {
  ssn: string; // Not needed!
  creditCard: string; // Store with payment processor
  politicalViews: string; // Sensitive, often unnecessary
}

// ✅ Good: Minimal data collection
interface UserProfile {
  username: string;
  email: string;
  preferences: UserPreferences;
}
```

### Encryption

- **In Transit**: TLS 1.3 for all API communications
- **At Rest**: Database encryption for sensitive fields
- **Application**: Bcrypt for passwords, AES-256 for PII

---

## Data Breach Response

### Response Plan

1. **Detect**: Monitor for breaches (logging, alerts)
2. **Assess**: Determine scope and severity
3. **Contain**: Stop the breach, secure systems
4. **Notify**: 
   - Supervisory authority within 72 hours (GDPR)
   - Affected users "without undue delay"
5. **Document**: Record the breach and response
6. **Review**: Update security measures

### Notification Template

```
Subject: Important Security Notice

Dear [Name],

We are writing to inform you of a security incident that may have affected your personal information.

WHAT HAPPENED:
[Brief description]

WHAT INFORMATION WAS INVOLVED:
[List data types]

WHAT WE ARE DOING:
[Response actions]

WHAT YOU CAN DO:
[Recommended actions]

For more information, contact: privacy@quemiai.com

Sincerely,
The Quemiai Team
```

---

## Compliance Checklist

### GDPR Compliance

- [ ] Privacy policy published and accessible
- [ ] Cookie consent banner implemented
- [ ] Data processing records maintained
- [ ] Data protection officer appointed (if required)
- [ ] Data protection impact assessment completed
- [ ] Data processing agreements with vendors
- [ ] User rights request process established
- [ ] Breach notification process documented
- [ ] Regular compliance audits scheduled

### CCPA Compliance

- [ ] "Do Not Sell" mechanism implemented
- [ ] Privacy notice updated for California residents
- [ ] 12-month data disclosure published
- [ ] Opt-out link prominent on homepage
- [ ] Consumer rights request form available
- [ ] Non-discrimination policy published
- [ ] Authorized agent process established

---

## Best Practices

### ✅ DO

1. **Be transparent**: Clear privacy policies
2. **Get explicit consent**: For non-essential processing
3. **Respond promptly**: 30 days for data requests
4. **Keep records**: Audit logs, consent history
5. **Train staff**: Privacy awareness and procedures
6. **Review regularly**: Update policies and practices
7. **Minimize data**: Collect only what's needed
8. **Secure data**: Encryption, access controls

### ❌ DON'T

1. **Don't assume consent**: Get explicit permission
2. **Don't ignore requests**: Respond to all user rights requests
3. **Don't retain unnecessarily**: Delete old data
4. **Don't transfer without safeguards**: Ensure adequate protection
5. **Don't share without consent**: Especially with third parties
6. **Don't ignore breaches**: Report as required by law

---

## Resources

- [GDPR Official Text](https://gdpr-info.eu/)
- [CCPA Official Text](https://oag.ca.gov/privacy/ccpa)
- [ICO GDPR Guide](https://ico.org.uk/for-organisations/guide-to-data-protection/guide-to-the-general-data-protection-regulation-gdpr/)
- [CCPA Compliance Guide](https://oag.ca.gov/privacy/ccpa/compliance)

---

**Last Updated**: October 2024  
**Review Schedule**: Quarterly
