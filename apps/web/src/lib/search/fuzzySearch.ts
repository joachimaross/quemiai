import Fuse from 'fuse.js';
import { User, Post } from '@/lib/types';

/**
 * Configuration options for fuzzy search
 */
export interface FuzzySearchOptions {
  threshold?: number; // 0.0 (exact) to 1.0 (anything)
  distance?: number; // Maximum distance to search
  includeScore?: boolean;
  minMatchCharLength?: number;
}

/**
 * Perform fuzzy search on users
 */
export function fuzzySearchUsers(
  users: User[],
  query: string,
  options: FuzzySearchOptions = {}
): User[] {
  if (!query.trim()) return users;

  const fuse = new Fuse(users, {
    keys: [
      { name: 'displayName', weight: 2 },
      { name: 'username', weight: 2 },
      { name: 'bio', weight: 1 },
      { name: 'location', weight: 0.5 },
    ],
    threshold: options.threshold ?? 0.3,
    distance: options.distance ?? 100,
    minMatchCharLength: options.minMatchCharLength ?? 2,
    includeScore: options.includeScore ?? false,
  });

  const results = fuse.search(query);
  return results.map((result) => result.item);
}

/**
 * Perform fuzzy search on posts
 */
export function fuzzySearchPosts(
  posts: Post[],
  query: string,
  options: FuzzySearchOptions = {}
): Post[] {
  if (!query.trim()) return posts;

  const fuse = new Fuse(posts, {
    keys: [
      { name: 'content', weight: 2 },
      { name: 'tags', weight: 1.5 },
      { name: 'user.displayName', weight: 1 },
      { name: 'user.username', weight: 1 },
    ],
    threshold: options.threshold ?? 0.4,
    distance: options.distance ?? 100,
    minMatchCharLength: options.minMatchCharLength ?? 2,
    includeScore: options.includeScore ?? false,
  });

  const results = fuse.search(query);
  return results.map((result) => result.item);
}

/**
 * Perform fuzzy search on hashtags
 */
export function fuzzySearchHashtags(
  hashtags: { tag: string; count: number }[],
  query: string,
  options: FuzzySearchOptions = {}
): { tag: string; count: number }[] {
  if (!query.trim()) return hashtags;

  const fuse = new Fuse(hashtags, {
    keys: ['tag'],
    threshold: options.threshold ?? 0.3,
    distance: options.distance ?? 100,
    minMatchCharLength: options.minMatchCharLength ?? 1,
    includeScore: options.includeScore ?? false,
  });

  const results = fuse.search(query);
  return results.map((result) => result.item);
}
