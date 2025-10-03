# API Reference - Strategic Improvements

Quick reference guide for all new API endpoints added in the strategic improvements.

## Base URL

```
http://localhost:3000  (development)
https://api.quemiai.com (production)
```

## Authentication

Most endpoints will require authentication (to be implemented):

```
Authorization: Bearer <jwt_token>
```

---

## 📖 Stories API

### Create Story
```http
POST /stories
Content-Type: application/json

{
  "authorId": "string (uuid)",
  "mediaUrl": "string (url)",
  "audioUrl": "string (url, optional)",
  "expiresAt": "string (ISO 8601, optional)"
}
```

### Get All Active Stories
```http
GET /stories?userId=<uuid>

Query Parameters:
  - userId (optional): Filter by author
```

### Get Story by ID
```http
GET /stories/:id
```

### Delete Story
```http
DELETE /stories/:id
Content-Type: application/json

{
  "userId": "string (uuid)"
}
```

### Add Reaction
```http
POST /stories/:id/reactions
Content-Type: application/json

{
  "userId": "string (uuid)",
  "emoji": "string"
}
```

### Remove Reaction
```http
DELETE /stories/:id/reactions?userId=<uuid>&emoji=<emoji>
```

### Add Reply
```http
POST /stories/:id/replies
Content-Type: application/json

{
  "userId": "string (uuid)",
  "content": "string"
}
```

### Get Story Replies
```http
GET /stories/:id/replies
```

---

## 📊 Analytics API

### Track Event
```http
POST /analytics/events
Content-Type: application/json

{
  "eventType": "string (post_view, post_like, etc)",
  "entityType": "string (post, user, story)",
  "entityId": "string (uuid)",
  "userId": "string (uuid, optional)",
  "metadata": "object (optional)",
  "ipAddress": "string (optional)",
  "userAgent": "string (optional)"
}
```

### Get Post Analytics
```http
GET /analytics/posts/:postId

Response:
{
  "id": "string",
  "postId": "string",
  "views": "number",
  "likes": "number",
  "comments": "number",
  "shares": "number",
  "engagementRate": "number",
  "reachCount": "number",
  "impressionCount": "number",
  ...
}
```

### Update Post Analytics
```http
POST /analytics/posts/:postId
Content-Type: application/json

{
  "views": "number (optional)",
  "likes": "number (optional)",
  "comments": "number (optional)",
  "shares": "number (optional)"
}
```

### Get User Analytics
```http
GET /analytics/users/:userId

Response:
{
  "totalPosts": "number",
  "totalFollowers": "number",
  "totalFollowing": "number",
  "totalLikes": "number",
  "totalViews": "number",
  "avgEngagementRate": "number",
  ...
}
```

### Get Top Posts
```http
GET /analytics/users/:userId/top-posts?limit=10

Query Parameters:
  - limit (optional): Number of posts (default: 10)
```

### Get Analytics Summary
```http
GET /analytics/users/:userId/summary?startDate=2024-01-01&endDate=2024-01-31

Query Parameters:
  - startDate: ISO 8601 date string
  - endDate: ISO 8601 date string
```

---

## ⚙️ Settings API

### Get User Settings
```http
GET /settings/:userId

Response: UserSettings object with all preferences
```

### Update Settings
```http
PUT /settings/:userId
Content-Type: application/json

{
  "theme": "dark",
  "fontSize": "large",
  "enableAiRecommendations": true,
  ...
}
```

### Update Notification Preferences
```http
PUT /settings/:userId/notifications
Content-Type: application/json

{
  "emailNotifications": true,
  "pushNotifications": true,
  "notifyOnLikes": true,
  "notifyOnComments": false,
  ...
}
```

### Update Privacy Settings
```http
PUT /settings/:userId/privacy
Content-Type: application/json

{
  "profileVisibility": "public|friends|private",
  "showEmail": false,
  "allowTagging": true,
  "allowMessagesFrom": "everyone|friends|nobody"
}
```

### Update Theme Settings
```http
PUT /settings/:userId/theme
Content-Type: application/json

{
  "theme": "light|dark|system",
  "fontSize": "small|medium|large",
  "highContrast": false,
  "reduceMotion": false
}
```

### Update AI Settings
```http
PUT /settings/:userId/ai
Content-Type: application/json

{
  "enableAiRecommendations": true,
  "enableSmartReplies": true,
  "enableContentFiltering": true
}
```

### Reset Settings
```http
PUT /settings/:userId/reset
```

---

## 👥 Social API

### Friend Suggestions

#### Get Mutual Followers
```http
GET /social/mutuals/:userId1/:userId2

Response: Array of User objects
```

#### Get Friend Suggestions
```http
GET /social/suggestions/:userId?limit=10

Query Parameters:
  - limit (optional): Number of suggestions (default: 10)

Response: Array of suggestions with user details
```

#### Generate Suggestions
```http
POST /social/suggestions/:userId/generate

Response: 
{
  "generatedCount": "number"
}
```

#### Dismiss Suggestion
```http
DELETE /social/suggestions/:userId/:suggestedUserId
```

### Groups

#### Get User Groups
```http
GET /social/groups/user/:userId

Response: Array of groups with membership details
```

#### Create Group
```http
POST /social/groups
Content-Type: application/json

{
  "name": "string",
  "creatorId": "string (uuid)",
  "description": "string (optional)",
  "isPrivate": "boolean (optional)"
}
```

#### Join Group
```http
POST /social/groups/:groupId/join
Content-Type: application/json

{
  "userId": "string (uuid)"
}
```

#### Leave Group
```http
DELETE /social/groups/:groupId/leave/:userId
```

### Gamification

#### Get All Badges
```http
GET /social/badges

Response: Array of Badge objects
```

#### Get User Badges
```http
GET /social/badges/user/:userId

Response: Array of UserBadge objects with badge details
```

#### Award Badge
```http
POST /social/badges/:badgeId/award
Content-Type: application/json

{
  "userId": "string (uuid)"
}
```

#### Get Leaderboard
```http
GET /social/leaderboard/:category?period=all_time&limit=100

Path Parameters:
  - category: posts|likes|followers|engagement

Query Parameters:
  - period (optional): daily|weekly|monthly|all_time (default: all_time)
  - limit (optional): Number of entries (default: 100)

Response: Array of leaderboard entries with user details
```

#### Update Leaderboard Score
```http
PUT /social/leaderboard/:userId
Content-Type: application/json

{
  "category": "string",
  "score": "number",
  "period": "string (optional)"
}
```

### Content Moderation

#### Create Report
```http
POST /social/reports
Content-Type: application/json

{
  "reporterId": "string (uuid)",
  "reportedId": "string (uuid)",
  "entityType": "user|post|comment|story",
  "entityId": "string (uuid)",
  "reason": "string",
  "description": "string (optional)"
}
```

#### Get All Reports
```http
GET /social/reports?status=pending&entityType=post&limit=100

Query Parameters:
  - status (optional): pending|reviewing|resolved|dismissed
  - entityType (optional): user|post|comment|story
  - limit (optional): Number of reports (default: 100)
```

#### Get Single Report
```http
GET /social/reports/:reportId
```

#### Update Report Status
```http
PUT /social/reports/:reportId
Content-Type: application/json

{
  "status": "reviewing|resolved|dismissed",
  "reviewerId": "string (uuid)",
  "resolution": "object (optional)"
}
```

#### Get Moderation Stats
```http
GET /social/moderation/stats

Response:
{
  "total": "number",
  "byStatus": {
    "pending": "number",
    "reviewing": "number",
    "resolved": "number",
    "dismissed": "number"
  },
  "byType": { ... },
  "byReason": { ... }
}
```

---

## 💡 Usage Examples

### Complete Story Flow

```javascript
// 1. Create a story
const story = await fetch('/stories', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    authorId: 'user-123',
    mediaUrl: 'https://cdn.example.com/video.mp4'
  })
});

// 2. Add a reaction
await fetch(`/stories/${story.id}/reactions`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'viewer-456',
    emoji: '❤️'
  })
});

// 3. Add a reply
await fetch(`/stories/${story.id}/replies`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'viewer-456',
    content: 'Great story!'
  })
});
```

### Analytics Tracking Flow

```javascript
// 1. Track a post view
await fetch('/analytics/events', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    eventType: 'post_view',
    entityType: 'post',
    entityId: 'post-789',
    userId: 'viewer-123'
  })
});

// 2. Update post analytics
await fetch('/analytics/posts/post-789', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    views: 1
  })
});

// 3. Get analytics dashboard data
const userAnalytics = await fetch('/analytics/users/user-123');
const topPosts = await fetch('/analytics/users/user-123/top-posts?limit=5');
```

### Social Features Flow

```javascript
// 1. Generate friend suggestions
await fetch('/social/suggestions/user-123/generate', {
  method: 'POST'
});

// 2. Get suggestions
const suggestions = await fetch('/social/suggestions/user-123?limit=10');

// 3. Create a group
const group = await fetch('/social/groups', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Photography Enthusiasts',
    creatorId: 'user-123',
    description: 'Share your best shots!'
  })
});

// 4. Get leaderboard
const leaderboard = await fetch('/social/leaderboard/posts?period=weekly');
```

---

## 🔧 Error Responses

All endpoints follow standard HTTP status codes:

```javascript
// Success
200 OK - Request successful
201 Created - Resource created

// Client Errors
400 Bad Request - Invalid input
401 Unauthorized - Authentication required
403 Forbidden - Insufficient permissions
404 Not Found - Resource not found
422 Unprocessable Entity - Validation failed
429 Too Many Requests - Rate limit exceeded

// Server Errors
500 Internal Server Error - Server error
503 Service Unavailable - Service temporarily down
```

Error response format:
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

---

## 📝 Data Types

### Common Types

```typescript
// UUID (User ID, Post ID, etc.)
type UUID = string; // Format: "550e8400-e29b-41d4-a716-446655440000"

// ISO 8601 DateTime
type DateTime = string; // Format: "2024-01-03T10:00:00Z"

// URL
type URL = string; // Format: "https://example.com/image.jpg"
```

### Entity Types
- `user` - User profile
- `post` - Regular post
- `comment` - Comment on a post
- `story` - Story content

### Event Types
- `post_view` - Post was viewed
- `post_like` - Post was liked
- `post_share` - Post was shared
- `profile_view` - Profile was viewed
- `story_view` - Story was viewed

---

## 🚀 Rate Limits

- General API: 100 requests per 15 minutes per IP
- Auth endpoints: 5 requests per 15 minutes per IP
- Analytics events: 1000 requests per 15 minutes per user

Rate limit headers:
```
RateLimit-Limit: 100
RateLimit-Remaining: 95
RateLimit-Reset: 1609459200
```

---

## 🔗 Related Documentation

- [STRATEGIC_IMPROVEMENTS.md](./STRATEGIC_IMPROVEMENTS.md) - Complete feature documentation
- [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) - Migration instructions
- [README.md](./README.md) - Project overview

---

**Version**: 1.0.0  
**Last Updated**: 2025-01-03  
**Status**: Production Ready
