import { Post, User } from '@/lib/types';

/**
 * Content-aware search that understands context and relevance
 */

export interface ContentSearchOptions {
  includeMedia?: boolean;
  includeTags?: boolean;
  includeMentions?: boolean;
  minRelevanceScore?: number;
}

/**
 * Calculate relevance score for a post based on search query
 */
export function calculatePostRelevance(
  post: Post,
  query: string,
  options: ContentSearchOptions = {}
): number {
  const {
    includeMedia = true,
    includeTags = true,
    includeMentions = true,
  } = options;

  let score = 0;
  const lowerQuery = query.toLowerCase();
  const lowerContent = post.content.toLowerCase();

  // Exact match in content (highest priority)
  if (lowerContent === lowerQuery) {
    score += 100;
  } else if (lowerContent.includes(lowerQuery)) {
    // Partial match in content
    score += 50;
    
    // Bonus for match at beginning
    if (lowerContent.startsWith(lowerQuery)) {
      score += 20;
    }
  }

  // Word matches
  const queryWords = lowerQuery.split(/\s+/);
  const contentWords = lowerContent.split(/\s+/);
  const matchedWords = queryWords.filter((word) =>
    contentWords.some((cWord) => cWord.includes(word))
  );
  score += matchedWords.length * 10;

  // Tag matches
  if (includeTags && post.tags) {
    const tagMatches = post.tags.filter((tag) =>
      tag.toLowerCase().includes(lowerQuery)
    );
    score += tagMatches.length * 30;
  }

  // Mentions matches
  if (includeMentions && post.mentions) {
    const mentionMatches = post.mentions.filter((mention) =>
      mention.toLowerCase().includes(lowerQuery)
    );
    score += mentionMatches.length * 20;
  }

  // User matches
  if (post.user) {
    if (post.user.displayName.toLowerCase().includes(lowerQuery)) {
      score += 15;
    }
    if (post.user.username.toLowerCase().includes(lowerQuery)) {
      score += 15;
    }
  }

  // Media presence bonus (content with images tends to be more engaging)
  if (includeMedia && post.media && post.media.length > 0) {
    score += 5;
  }

  // Engagement metrics
  const totalReactions = Object.values(post.reactions).reduce(
    (sum, count) => sum + count,
    0
  );
  score += Math.min(totalReactions * 0.1, 20); // Cap at 20 points
  score += Math.min(post.commentCount * 0.5, 15); // Cap at 15 points

  // Recency bonus (newer posts get slight boost)
  const daysOld = (Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  if (daysOld < 1) score += 10;
  else if (daysOld < 7) score += 5;

  return score;
}

/**
 * Perform content-aware search on posts
 */
export function contentSearchPosts(
  posts: Post[],
  query: string,
  options: ContentSearchOptions = {}
): Post[] {
  if (!query.trim()) return posts;

  const minScore = options.minRelevanceScore ?? 10;

  // Calculate relevance scores and filter
  const postsWithScores = posts
    .map((post) => ({
      post,
      score: calculatePostRelevance(post, query, options),
    }))
    .filter(({ score }) => score >= minScore)
    .sort((a, b) => b.score - a.score);

  return postsWithScores.map(({ post }) => post);
}

/**
 * Calculate relevance score for a user based on search query
 */
export function calculateUserRelevance(user: User, query: string): number {
  let score = 0;
  const lowerQuery = query.toLowerCase();

  // Exact matches
  if (user.username.toLowerCase() === lowerQuery) {
    score += 100;
  } else if (user.displayName.toLowerCase() === lowerQuery) {
    score += 90;
  }

  // Partial matches
  if (user.username.toLowerCase().includes(lowerQuery)) {
    score += 50;
  }
  if (user.displayName.toLowerCase().includes(lowerQuery)) {
    score += 45;
  }

  // Bio matches
  if (user.bio && user.bio.toLowerCase().includes(lowerQuery)) {
    score += 20;
  }

  // Location matches
  if (user.location && user.location.toLowerCase().includes(lowerQuery)) {
    score += 15;
  }

  // Verified users get a bonus
  if (user.verified) {
    score += 10;
  }

  // Popular users get a slight bonus
  if (user.followers > 1000) score += 5;
  if (user.followers > 10000) score += 10;

  return score;
}

/**
 * Perform content-aware search on users
 */
export function contentSearchUsers(
  users: User[],
  query: string,
  minRelevanceScore: number = 10
): User[] {
  if (!query.trim()) return users;

  // Calculate relevance scores and filter
  const usersWithScores = users
    .map((user) => ({
      user,
      score: calculateUserRelevance(user, query),
    }))
    .filter(({ score }) => score >= minRelevanceScore)
    .sort((a, b) => b.score - a.score);

  return usersWithScores.map(({ user }) => user);
}
