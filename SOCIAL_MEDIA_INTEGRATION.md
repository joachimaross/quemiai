# TikTok and Instagram Integration Guide

This guide provides detailed information about the TikTok and Instagram integrations in the Quemiai application.

## Table of Contents

- [Overview](#overview)
- [Setup](#setup)
- [TikTok Integration](#tiktok-integration)
- [Instagram Integration](#instagram-integration)
- [API Usage](#api-usage)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## Overview

The Quemiai application now supports integrations with TikTok and Instagram, allowing users to:

- Connect their TikTok and Instagram accounts
- Fetch user data and statistics
- Retrieve posts/videos from connected accounts
- Publish content to TikTok and Instagram
- Disconnect accounts when needed

## Setup

### Prerequisites

1. **TikTok Developer Account**
   - Register at [TikTok for Developers](https://developers.tiktok.com/)
   - Create an application
   - Obtain Client Key and Client Secret
   - Configure redirect URI

2. **Instagram/Facebook Developer Account**
   - Register at [Meta for Developers](https://developers.facebook.com/)
   - Create an app with Instagram Basic Display or Instagram Graph API
   - Obtain Client ID and Client Secret
   - Configure redirect URI

### Environment Configuration

Copy `.env.example` to `.env` and fill in the required credentials:

```bash
# TikTok API Keys
TIKTOK_CLIENT_KEY=your_tiktok_client_key
TIKTOK_CLIENT_SECRET=your_tiktok_client_secret
TIKTOK_REDIRECT_URI=http://localhost:3000/auth/tiktok/callback

# Instagram API Keys
INSTAGRAM_CLIENT_ID=your_instagram_client_id
INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret
INSTAGRAM_REDIRECT_URI=http://localhost:3000/auth/instagram/callback
```

### Database Setup

The Prisma schema includes a `SocialMediaConnection` model to store user connections:

```prisma
model SocialMediaConnection {
  id              String   @id @default(uuid())
  userId          String
  platform        String   // 'tiktok', 'instagram', 'twitter', 'facebook'
  platformUserId  String
  platformUsername String?
  accessToken     String
  refreshToken    String?
  tokenExpiresAt  DateTime?
  isActive        Boolean  @default(true)
  metadata        String?  // JSON string for additional platform-specific data
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  user            User     @relation(fields: [userId], references: [id])
  
  @@unique([userId, platform])
}
```

Run Prisma migrations to create the database schema:

```bash
npx prisma migrate dev --name add_social_media_connections
npx prisma generate
```

## TikTok Integration

### Features

- **Authentication**: OAuth 2.0 flow with TikTok API
- **User Data**: Fetch follower count, following count, likes, video count
- **Videos**: Retrieve user's video list with pagination
- **Publishing**: Upload and publish videos to TikTok
- **Analytics**: Get video insights (views, likes, comments, shares)
- **Token Management**: Automatic token refresh

### OAuth Flow

1. **Get Authorization URL**:
   ```typescript
   import { tiktokService } from './services/tiktok';
   
   const authUrl = tiktokService.getAuthorizationUrl('random-state-string');
   // Redirect user to authUrl
   ```

2. **Handle Callback**:
   ```typescript
   // After user authorizes, TikTok redirects with a code
   const code = req.query.code;
   
   // Call the connect endpoint
   await fetch('/api/v1/social-media/connect/tiktok', {
     method: 'POST',
     headers: {
       'Authorization': `Bearer ${userToken}`,
       'Content-Type': 'application/json'
     },
     body: JSON.stringify({ code })
   });
   ```

### API Methods

#### Get User Info
```typescript
const userInfo = await tiktokService.getUserInfo(accessToken);
// Returns: { open_id, display_name, follower_count, video_count, ... }
```

#### Get User Videos
```typescript
const videos = await tiktokService.getUserVideos(accessToken, cursor, maxCount);
// Returns: { videos: [...], cursor: 'next', has_more: true }
```

#### Publish Video
```typescript
const result = await tiktokService.publishVideo(
  accessToken,
  'https://example.com/video.mp4',
  'Video Title',
  'Optional description'
);
```

### Scopes Required

- `user.info.basic`: Access to basic user information
- `video.list`: Access to user's video list
- `video.upload`: Permission to upload videos

## Instagram Integration

### Features

- **Authentication**: OAuth 2.0 with long-lived tokens (60 days)
- **User Data**: Fetch profile info, followers, media count
- **Media**: Retrieve user's posts with pagination
- **Publishing**: Post photos and videos to Instagram
- **Insights**: Get engagement metrics for business accounts
- **Token Management**: Refresh tokens to extend validity

### OAuth Flow

1. **Get Authorization URL**:
   ```typescript
   import { instagramService } from './services/instagram';
   
   const authUrl = instagramService.getAuthorizationUrl('random-state-string');
   // Redirect user to authUrl
   ```

2. **Handle Callback**:
   ```typescript
   // After user authorizes, Instagram redirects with a code
   const code = req.query.code;
   
   // Call the connect endpoint
   await fetch('/api/v1/social-media/connect/instagram', {
     method: 'POST',
     headers: {
       'Authorization': `Bearer ${userToken}`,
       'Content-Type': 'application/json'
     },
     body: JSON.stringify({ code })
   });
   ```

### API Methods

#### Get User Profile
```typescript
const profile = await instagramService.getUserProfile(accessToken, userId);
// Returns: { id, username, followers_count, media_count, ... }
```

#### Get User Media
```typescript
const media = await instagramService.getUserMedia(accessToken, userId, limit);
// Returns: { data: [...], paging: { cursors: {...} } }
```

#### Publish Content
```typescript
const result = await instagramService.postContent(
  accessToken,
  userId,
  'https://example.com/image.jpg',
  'Photo caption',
  false // isVideo
);
// Returns: { id: '...', permalink: 'https://instagram.com/p/...' }
```

### Scopes Required

- `instagram_basic`: Basic profile information
- `instagram_content_publish`: Permission to publish content
- `pages_show_list`: Access to Facebook pages (if needed)

## API Usage

### Connect TikTok Account

```bash
POST /api/v1/social-media/connect/tiktok
Authorization: Bearer {firebase_token}
Content-Type: application/json

{
  "code": "authorization_code_from_tiktok"
}
```

### Connect Instagram Account

```bash
POST /api/v1/social-media/connect/instagram
Authorization: Bearer {firebase_token}
Content-Type: application/json

{
  "code": "authorization_code_from_instagram"
}
```

### Get Connected Accounts

```bash
GET /api/v1/social-media/connections
Authorization: Bearer {firebase_token}
```

### Fetch User Data

```bash
GET /api/v1/social-media/user-data?platforms=tiktok,instagram
Authorization: Bearer {firebase_token}
```

### Fetch Posts

```bash
GET /api/v1/social-media/posts?platforms=tiktok,instagram&limit=20
Authorization: Bearer {firebase_token}
```

### Create Post

```bash
POST /api/v1/social-media/post
Authorization: Bearer {firebase_token}
Content-Type: application/json

{
  "platforms": ["tiktok", "instagram"],
  "mediaUrl": "https://example.com/video.mp4",
  "caption": "Check out my new content!",
  "isVideo": true
}
```

### Disconnect Account

```bash
DELETE /api/v1/social-media/disconnect/tiktok
Authorization: Bearer {firebase_token}
```

## Testing

The project includes comprehensive tests for both services and API endpoints.

### Run All Tests

```bash
npm test
```

### Run Specific Test Suite

```bash
# TikTok service tests
npm test -- tiktok.test.ts

# Instagram service tests
npm test -- instagram.test.ts

# Social media API tests
npm test -- social-media.test.ts
```

### Test Coverage

```bash
npm run test:cov
```

## Troubleshooting

### Common Issues

#### 1. Token Expired

**Error**: `Invalid or expired token`

**Solution**: 
- For TikTok: Use the refresh token to get a new access token
- For Instagram: Use the `refreshLongLivedToken` method to extend token validity

```typescript
// TikTok
const newToken = await tiktokService.refreshAccessToken(refreshToken);

// Instagram
const newToken = await instagramService.refreshLongLivedToken(currentToken);
```

#### 2. Rate Limit Exceeded

**Error**: `Too many requests`

**Solution**: Implement rate limiting and request queuing in your application. Both platforms have daily/hourly limits.

#### 3. Invalid Redirect URI

**Error**: `redirect_uri_mismatch`

**Solution**: Ensure the redirect URI in your environment variables matches exactly what's configured in the developer console (including protocol, domain, and path).

#### 4. Insufficient Permissions

**Error**: `insufficient_scope`

**Solution**: Review the required scopes for your operations and update your OAuth authorization request.

### Debug Mode

Enable detailed logging by setting the log level:

```bash
LOG_LEVEL=debug npm start
```

### API Testing with Postman

1. Import the Swagger documentation from `/api-docs`
2. Configure environment variables for tokens
3. Test each endpoint individually

## Security Best Practices

1. **Never commit credentials**: Keep API keys and secrets in environment variables
2. **Use HTTPS**: Always use secure connections in production
3. **Validate tokens**: Check token expiration before making API calls
4. **Store tokens securely**: Encrypt tokens in the database
5. **Implement rate limiting**: Protect your API from abuse
6. **Monitor API usage**: Track API calls to detect unusual patterns

## Additional Resources

- [TikTok for Developers Documentation](https://developers.tiktok.com/doc)
- [Instagram Graph API Documentation](https://developers.facebook.com/docs/instagram-api)
- [OAuth 2.0 Specification](https://oauth.net/2/)

## Support

For issues or questions:
1. Check the [PHASE2_API.md](./PHASE2_API.md) documentation
2. Review test files for usage examples
3. Open an issue in the GitHub repository
