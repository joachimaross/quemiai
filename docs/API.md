# QUEMI API Reference

## Authentication

All API endpoints require authentication unless otherwise specified.

Include authentication token in request headers:
```
Authorization: Bearer <token>
```

## Search API

### Search
`GET /api/search`

Search for posts, users, and hashtags.

**Query Parameters:**
- `query` (required): Search query string
- `type` (optional): Filter by type - `all`, `posts`, `users`, `hashtags`. Default: `all`
- `sortBy` (optional): Sort results - `relevant`, `recent`, `popular`. Default: `relevant`
- `dateRange` (optional): Filter by date - `all`, `today`, `week`, `month`. Default: `all`

**Response:**
```json
{
  "users": [],
  "posts": [],
  "hashtags": [],
  "metadata": {
    "query": "search term",
    "type": "all",
    "sortBy": "relevant",
    "dateRange": "all",
    "totalResults": 0
  }
}
```

### Advanced Search
`POST /api/search/advanced`

Perform advanced search with complex filters and pagination.

**Request Body:**
```json
{
  "query": "search term",
  "filters": {
    "type": "all",
    "sortBy": "relevant",
    "dateRange": "all"
  },
  "pagination": {
    "page": 1,
    "limit": 20
  }
}
```

**Response:**
```json
{
  "users": [],
  "posts": [],
  "hashtags": [],
  "metadata": {
    "query": "search term",
    "filters": {},
    "pagination": {
      "page": 1,
      "limit": 20
    },
    "totalResults": 0
  }
}
```

### Search Suggestions
`GET /api/search/suggestions`

Get autocomplete suggestions for search.

**Query Parameters:**
- `query` (required): Partial search query

**Response:**
```json
{
  "users": [],
  "hashtags": [],
  "topics": []
}
```

### Trending Searches
`GET /api/search/trending`

Get currently trending searches and topics.

**Response:**
```json
{
  "hashtags": [],
  "topics": [],
  "posts": []
}
```

## Users API

### Get User
`GET /api/users/:id`

Get user profile information.

### Get User Posts
`GET /api/users/:id/posts`

Get posts by a specific user.

## Posts API

### Get Posts
`GET /api/posts`

Get list of posts.

### Create Post
`POST /api/posts`

Create a new post.

### Get Post
`GET /api/posts/:id`

Get a specific post.

### Update Post
`PUT /api/posts/:id`

Update a post.

### Delete Post
`DELETE /api/posts/:id`

Delete a post.

## Messages API

### Get Conversations
`GET /api/messages`

Get all conversations for the authenticated user.

### Get Conversation
`GET /api/messages/:conversationId`

Get a specific conversation.

### Send Message
`POST /api/messages/:conversationId/messages`

Send a message in a conversation.

## Error Responses

All endpoints may return the following error responses:

**400 Bad Request**
```json
{
  "error": "Error message"
}
```

**401 Unauthorized**
```json
{
  "error": "Authentication required"
}
```

**404 Not Found**
```json
{
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "error": "Internal server error"
}
```
