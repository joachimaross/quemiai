# Database Schema

This document outlines the database schema for the Joachima social media super app, using Firestore.

## Users Collection

- **Collection:** `users`
- **Document ID:** `userId`

**Fields:**

- `username`: (String) The user's unique username.
- `email`: (String) The user's email address.
- `profilePicture`: (String) URL to the user's profile picture.
- `bannerPicture`: (String, Optional) URL to the user's banner image.
- `bio`: (String) A short user biography.
- `location`: (String) The user's geographical location.
- `externalLinks`: (Array of Objects, Optional) e.g., `[{ type: 'website', url: '...', title: '...', icon: '...', order: 1 }]`.
- `privacySettings`: (Map, Optional) e.g., `{ profileVisibility: 'public' | 'private' | 'followers', messagePermissions: 'all' | 'followers' | 'none' }`.
- `followersCount`: (Number) The number of users following this user. Default 0.
- `followingCount`: (Number) The number of users this user is following. Default 0.
- `linkedSocialAccounts`: (Map) A map of linked social media accounts (e.g., `{ facebook: "...", twitter: "..." }`).
- `preferences`: (Map) User preferences (e.g., `{ theme: "dark", notifications: true }`).
- `dashboardLayout`: (JSON) Stores the layout of widgets on the dashboard (e.g., position, size of widgets).
- `customTabs`: (Array of Objects) Stores configurations for custom tabs (e.g., `[{ name: 'My Social Feed', type: 'social', platforms: ['facebook', 'twitter'] }]`).
- `themeSettings`: (JSON) Stores user's theme preferences (e.g., `{ primaryColor: '#FF0000', darkMode: true }`).
- `createdAt`: (Timestamp) The timestamp when the user account was created.
- `updatedAt`: (Timestamp) The timestamp when the user account was last updated.

## Relationships Collection

- **Collection:** `relationships`
- **Document ID:** `relationshipId` (auto-generated)

**Fields:**

- `followerId`: (String) The ID of the user who is following.
- `followingId`: (String) The ID of the user being followed.
- `createdAt`: (Timestamp) The timestamp when the relationship was created.
- **Indexes:** `followerId`, `followingId`, `followerId + followingId` (unique compound index)

## Feeds & Posts Collection

- **Collection:** `posts`
- **Document ID:** `postId`

**Fields:**

- `userId`: (String) The ID of the user who created the post.
- `content`: (String) The text content of the post.
- `media`: (Array) An array of URLs to images or videos in the post.
- `platform`: (String) The platform the post originated from (e.g., "joachima", "facebook", "twitter").
- `likes`: (Number) The number of likes on the post. Default 0.
- `comments`: (Number) The number of comments on the post. Default 0.
- `shares`: (Number) The number of shares of the post. Default 0.
- `createdAt`: (Timestamp) The timestamp when the post was created.
- `updatedAt`: (Timestamp, Optional) The timestamp when the post was last updated.

**Subcollections:**

- `comments`: A subcollection of comments on the post.
  - **Document ID:** `commentId`
  - **Fields:** `userId` (String), `content` (String), `createdAt` (Timestamp)
- `likes`: A subcollection of users who liked the post.
  - **Document ID:** `likeId` (or `userId` if only one like per user)
  - **Fields:** `userId` (String), `createdAt` (Timestamp)

## Reposts Collection

- **Collection:** `reposts`
- **Document ID:** `repostId` (auto-generated)

**Fields:**

- `userId`: (String) The ID of the user who reposted.
- `originalPostId`: (String) The ID of the original post that was reposted.
- `repostContent`: (String, Optional) Optional text added by the user when reposting.
- `createdAt`: (Timestamp) The timestamp when the post was reposted.
- **Indexes:** `userId`, `originalPostId`

## Messaging

- **Collection:** `conversations`
- **Document ID:** `conversationId`

**Fields:**

- `participants`: (Array) An array of user IDs participating in the conversation.
- `lastMessage`: (String) The last message sent in the conversation.
- `lastMessageTimestamp`: (Timestamp) The timestamp of the last message.
- `isGroupChat`: (Boolean) Whether the conversation is a group chat.
- `groupName`: (String) The name of the group chat (if applicable).

**Subcollections:**

- `messages`: A subcollection of messages in the conversation.
  - **Document ID:** `messageId`
  - **Fields:** `senderId` (String), `content` (String), `createdAt` (Timestamp), `readBy` (Array of Strings, Optional)

## Analytics

- **Collection:** `analytics`
- **Document ID:** `analyticsId`

**Fields:**

- `userId`: (String) The ID of the user the analytics belong to.
- `postId`: (String) The ID of the post the analytics belong to.
- `engagementType`: (String) The type of engagement (e.g., "like", "comment", "share").
- `platform`: (String) The platform the engagement occurred on.
- `createdAt`: (Timestamp) The timestamp of the engagement.

## Marketplace

- **Collection:** `creators`
- **Document ID:** `creatorId` (same as `userId`)

**Fields:**

- `portfolio`: (Array) An array of URLs to portfolio items.
- `skills`: (Array) An array of creator skills.
- `rating`: (Number) The creator's average rating.

- **Collection:** `listings`
- **Document ID:** `listingId`

**Fields:**

- `creatorId`: (String) The ID of the creator who created the listing.
- `title`: (String) The title of the listing.
- `description`: (String) The description of the listing.
- `price`: (Number) The price of the listing.
- `createdAt`: (Timestamp) The timestamp when the listing was created.

- **Collection:** `transactions`
- **Document ID:** `transactionId`

**Fields:**

- `listingId`: (String) The ID of the listing the transaction is for.
- `buyerId`: (String) The ID of the buyer.
- `sellerId`: (String) The ID of the seller.
- `amount`: (Number) The transaction amount.
- `status`: (String) The status of the transaction (e.g., "pending", "completed", "cancelled").
- `createdAt`: (Timestamp) The timestamp when the transaction was created.
