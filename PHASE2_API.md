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
- **`DELETE /api/v1/disconnect/facebook`**: Disconnect a Facebook account.
  - **Response**: `{ "status": "success", "message": "Facebook account disconnected successfully." }`
- **`DELETE /api/v1/disconnect/twitter`**: Disconnect a Twitter account.
  - **Response**: `{ "status": "success", "message": "Twitter account disconnected successfully." }`
- **`DELETE /api/v1/disconnect/instagram`**: Disconnect an Instagram account.
  - **Response**: `{ "status": "success", "message": "Instagram account disconnected successfully." }`

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
