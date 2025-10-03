# Social Media Integration (Phase 2) API Design

This document outlines the API endpoints for Phase 2 of the Joachima Social Media Super App, focusing on social media integration.

## Assumptions for Phase 1 (Already Implemented)

- User authentication (signup, login, logout).
- Basic user profiles.
- Ability to create, read, update, and delete text-based posts.

## API Endpoints

### Authentication

- **`POST /api/v1/connect/facebook`**: Connect a Facebook account.
  - **Request Body**: `{ "accessToken": "..." }`
  - **Response**: `{ "status": "success", "message": "Facebook account connected successfully." }`
- **`POST /api/v1/connect/twitter`**: Connect a Twitter account.
  - **Request Body**: `{ "accessToken": "...", "accessSecret": "..." }`
  - **Response**: `{ "status": "success", "message": "Twitter account connected successfully." }`
- **`POST /api/v1/connect/instagram`**: Connect an Instagram account.
  - **Request Body**: `{ "accessToken": "..." }`
  - **Response**: `{ "status": "success", "message": "Instagram account connected successfully." }`
- **`POST /api/v1/connect/tiktok`**: Connect a TikTok account.
  - **Request Body**: `{ "code": "..." }`
  - **Response**: `{ "status": "success", "message": "TikTok account connected successfully." }`
- **`DELETE /api/v1/disconnect/facebook`**: Disconnect a Facebook account.
  - **Response**: `{ "status": "success", "message": "Facebook account disconnected successfully." }`
- **`DELETE /api/v1/disconnect/twitter`**: Disconnect a Twitter account.
  - **Response**: `{ "status": "success", "message": "Twitter account disconnected successfully." }`
- **`DELETE /api/v1/disconnect/instagram`**: Disconnect an Instagram account.
  - **Response**: `{ "status": "success", "message": "Instagram account disconnected successfully." }`
- **`DELETE /api/v1/disconnect/tiktok`**: Disconnect a TikTok account.
  - **Response**: `{ "status": "success", "message": "TikTok account disconnected successfully." }`

### Content Management

- **`GET /api/v1/posts`**: Get a user's posts from all connected social media accounts.
  - **Query Parameters**: `?platforms=facebook,twitter,instagram`
  - **Response**: A JSON array of post objects.
- **`POST /api/v1/posts`**: Create a new post and publish it to selected social media accounts.
  - **Request Body**: `{ "content": "...", "platforms": ["facebook", "twitter"] }`
  - **Response**: The created post object.
- **`GET /api/v1/posts/{postId}`**: Get a specific post.
  - **Response**: The post object.
- **`PUT /api/v1/posts/{postId}`**: Update a post on selected social media accounts.
  - **Request Body**: `{ "content": "..." }`
  - **Response**: The updated post object.
- **`DELETE /api/v1/posts/{postId}`**: Delete a post from selected social media accounts.
  - **Response**: `{ "status": "success", "message": "Post deleted successfully." }`

### Engagement

- **`POST /api/v1/posts/{postId}/like`**: Like a post on a specific social media platform.
  - **Request Body**: `{ "platform": "facebook" }`
  - **Response**: `{ "status": "success" }`
- **`POST /api/v1/posts/{postId}/comment`**: Comment on a post on a specific social media platform.
  - **Request Body**: `{ "platform": "twitter", "comment": "..." }`
  - **Response**: The created comment object.
- **`POST /api/v1/posts/{postId}/share`**: Share a post on a specific social media platform.
  - **Request Body**: `{ "platform": "instagram" }`
  - **Response**: `{ "status": "success" }`

### Analytics

- **`GET /api/v1/analytics/summary`**: Get a summary of engagement (likes, comments, shares) across all connected accounts.
  - **Response**: A JSON object with engagement statistics.
- **`GET /api/v1/analytics/posts/{postId}`**: Get detailed analytics for a specific post.
  - **Response**: A JSON object with detailed post analytics.

## Social Media Integration API (Extended)

### TikTok Integration

- **`POST /api/v1/social-media/connect/tiktok`**: Connect a TikTok account via OAuth.
  - **Request Body**: `{ "code": "authorization_code" }`
  - **Response**: 
    ```json
    {
      "status": "success",
      "message": "TikTok account connected successfully",
      "data": {
        "platform": "tiktok",
        "username": "tiktok_username",
        "followerCount": 10000
      }
    }
    ```
  - **Description**: Exchanges OAuth authorization code for access token, fetches user information, and stores the connection.

- **`DELETE /api/v1/social-media/disconnect/tiktok`**: Disconnect TikTok account.
  - **Response**: `{ "status": "success", "message": "TikTok account disconnected successfully" }`

### Instagram Integration

- **`POST /api/v1/social-media/connect/instagram`**: Connect an Instagram account via OAuth.
  - **Request Body**: `{ "code": "authorization_code" }`
  - **Response**: 
    ```json
    {
      "status": "success",
      "message": "Instagram account connected successfully",
      "data": {
        "platform": "instagram",
        "username": "instagram_username",
        "followersCount": 20000
      }
    }
    ```
  - **Description**: Exchanges OAuth code for long-lived access token (60 days), fetches profile info, and stores the connection.

- **`DELETE /api/v1/social-media/disconnect/instagram`**: Disconnect Instagram account.
  - **Response**: `{ "status": "success", "message": "Instagram account disconnected successfully" }`

### Unified Social Media Endpoints

- **`GET /api/v1/social-media/connections`**: Get all connected social media accounts.
  - **Response**: 
    ```json
    {
      "status": "success",
      "data": [
        {
          "id": "connection-id",
          "platform": "tiktok",
          "platformUsername": "username",
          "isActive": true,
          "tokenExpiresAt": "2024-12-31T00:00:00Z",
          "metadata": { ... },
          "createdAt": "2024-01-01T00:00:00Z",
          "updatedAt": "2024-01-01T00:00:00Z"
        }
      ]
    }
    ```

- **`GET /api/v1/social-media/user-data`**: Fetch user data from connected platforms.
  - **Query Parameters**: `?platforms=tiktok,instagram`
  - **Response**:
    ```json
    {
      "status": "success",
      "data": {
        "tiktok": {
          "username": "tiktok_user",
          "followerCount": 10000,
          "followingCount": 500,
          "likesCount": 50000,
          "videoCount": 100
        },
        "instagram": {
          "username": "instagram_user",
          "followersCount": 20000,
          "followsCount": 300,
          "mediaCount": 200
        }
      }
    }
    ```

- **`GET /api/v1/social-media/posts`**: Fetch recent posts from connected platforms.
  - **Query Parameters**: `?platforms=tiktok,instagram&limit=20`
  - **Response**:
    ```json
    {
      "status": "success",
      "data": {
        "tiktok": {
          "videos": [...],
          "cursor": "next-page-token",
          "has_more": true
        },
        "instagram": {
          "data": [...],
          "paging": { ... }
        }
      }
    }
    ```

- **`POST /api/v1/social-media/post`**: Create a post on selected platforms.
  - **Request Body**:
    ```json
    {
      "platforms": ["tiktok", "instagram"],
      "mediaUrl": "https://example.com/video.mp4",
      "caption": "Check out my new post!",
      "isVideo": true
    }
    ```
  - **Response**:
    ```json
    {
      "status": "success",
      "message": "Post creation completed",
      "data": {
        "tiktok": {
          "success": true,
          "data": { "publish_id": "..." }
        },
        "instagram": {
          "success": true,
          "data": { "id": "...", "permalink": "..." }
        }
      }
    }
    ```

## Configuration

### Environment Variables

Add the following to your `.env` file:

```bash
# TikTok API Keys
TIKTOK_CLIENT_KEY=your_tiktok_client_key
TIKTOK_CLIENT_SECRET=your_tiktok_client_secret
TIKTOK_REDIRECT_URI=your_redirect_uri

# Instagram API Keys
INSTAGRAM_CLIENT_ID=your_instagram_client_id
INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret
INSTAGRAM_ACCESS_TOKEN=your_long_lived_token
INSTAGRAM_REDIRECT_URI=your_redirect_uri
```

## OAuth Flows

### TikTok OAuth Flow

1. Redirect user to TikTok authorization URL (obtained from `TikTokService.getAuthorizationUrl()`)
2. User grants permission
3. TikTok redirects back with authorization code
4. Call `POST /api/v1/social-media/connect/tiktok` with the code
5. Service exchanges code for access token and stores connection

### Instagram OAuth Flow

1. Redirect user to Instagram authorization URL (obtained from `InstagramService.getAuthorizationUrl()`)
2. User grants permission
3. Instagram redirects back with authorization code
4. Call `POST /api/v1/social-media/connect/instagram` with the code
5. Service exchanges code for long-lived token (60 days) and stores connection

## Features

### TikTok Features
- OAuth 2.0 authentication
- Fetch user profile and statistics (followers, videos, likes)
- Get user's video list with pagination
- Publish videos to TikTok
- Get video insights and analytics
- Token refresh mechanism

### Instagram Features
- OAuth 2.0 authentication with long-lived tokens (60 days)
- Fetch user profile and business insights
- Get user's media (posts) with pagination
- Publish photos and videos to Instagram
- Get media insights (engagement, impressions, reach)
- Token refresh to extend validity

## Rate Limiting

Both TikTok and Instagram APIs have rate limits. The application handles errors gracefully and returns appropriate messages when limits are reached. Consider implementing:

- Request queuing for bulk operations
- Caching frequently accessed data
- Retry logic with exponential backoff

## Error Handling

All endpoints return standardized error responses:

```json
{
  "status": "error",
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

Common error scenarios:
- Invalid or expired tokens (401)
- Missing required parameters (400)
- Platform connection not found (404)
- API rate limits exceeded (429)
- Platform API errors (500)

