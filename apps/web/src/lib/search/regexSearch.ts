import { User, Post } from '@/lib/types';

/**
 * Perform regex-based search on users
 */
export function regexSearchUsers(users: User[], pattern: string): User[] {
  if (!pattern.trim()) return users;

  try {
    const regex = new RegExp(pattern, 'i');
    return users.filter(
      (user) =>
        regex.test(user.displayName) ||
        regex.test(user.username) ||
        regex.test(user.bio || '') ||
        regex.test(user.location || '')
    );
  } catch (error) {
    // Invalid regex pattern, fall back to simple string search
    console.warn('Invalid regex pattern:', error);
    const lowerPattern = pattern.toLowerCase();
    return users.filter(
      (user) =>
        user.displayName.toLowerCase().includes(lowerPattern) ||
        user.username.toLowerCase().includes(lowerPattern)
    );
  }
}

/**
 * Perform regex-based search on posts
 */
export function regexSearchPosts(posts: Post[], pattern: string): Post[] {
  if (!pattern.trim()) return posts;

  try {
    const regex = new RegExp(pattern, 'i');
    return posts.filter(
      (post) =>
        regex.test(post.content) ||
        post.tags?.some((tag) => regex.test(tag)) ||
        regex.test(post.user?.displayName || '') ||
        regex.test(post.user?.username || '')
    );
  } catch (error) {
    // Invalid regex pattern, fall back to simple string search
    console.warn('Invalid regex pattern:', error);
    const lowerPattern = pattern.toLowerCase();
    return posts.filter(
      (post) =>
        post.content.toLowerCase().includes(lowerPattern) ||
        post.tags?.some((tag) => tag.toLowerCase().includes(lowerPattern))
    );
  }
}

/**
 * Validate if a string is a valid regex pattern
 */
export function isValidRegex(pattern: string): boolean {
  try {
    new RegExp(pattern);
    return true;
  } catch {
    return false;
  }
}
