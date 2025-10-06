import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Offline Storage Service
 * Provides offline data persistence using AsyncStorage
 * Implements caching and synchronization strategies
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt?: number;
}

export class OfflineStorageService {
  private static readonly PREFIX = '@quemiai:';
  private static readonly CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours

  /**
   * Save data to offline storage with expiration
   */
  static async set<T>(key: string, value: T, expiresIn?: number): Promise<void> {
    try {
      const item: CacheItem<T> = {
        data: value,
        timestamp: Date.now(),
        expiresAt: expiresIn ? Date.now() + expiresIn : undefined,
      };
      await AsyncStorage.setItem(
        `${this.PREFIX}${key}`,
        JSON.stringify(item)
      );
    } catch (error) {
      console.error('Error saving to offline storage:', error);
      throw error;
    }
  }

  /**
   * Get data from offline storage
   * Returns null if expired or not found
   */
  static async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await AsyncStorage.getItem(`${this.PREFIX}${key}`);
      if (!raw) return null;

      const item: CacheItem<T> = JSON.parse(raw);

      // Check if expired
      if (item.expiresAt && Date.now() > item.expiresAt) {
        await this.remove(key);
        return null;
      }

      return item.data;
    } catch (error) {
      console.error('Error reading from offline storage:', error);
      return null;
    }
  }

  /**
   * Remove item from offline storage
   */
  static async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`${this.PREFIX}${key}`);
    } catch (error) {
      console.error('Error removing from offline storage:', error);
    }
  }

  /**
   * Clear all offline storage data
   */
  static async clear(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const quemiKeys = keys.filter(key => key.startsWith(this.PREFIX));
      await AsyncStorage.multiRemove(quemiKeys);
    } catch (error) {
      console.error('Error clearing offline storage:', error);
    }
  }

  /**
   * Get multiple items at once
   */
  static async getMultiple<T>(keys: string[]): Promise<Map<string, T | null>> {
    const result = new Map<string, T | null>();
    
    try {
      const prefixedKeys = keys.map(key => `${this.PREFIX}${key}`);
      const items = await AsyncStorage.multiGet(prefixedKeys);

      items.forEach(([key, value], index) => {
        const originalKey = keys[index];
        if (value) {
          try {
            const item: CacheItem<T> = JSON.parse(value);
            if (!item.expiresAt || Date.now() <= item.expiresAt) {
              result.set(originalKey, item.data);
            } else {
              result.set(originalKey, null);
            }
          } catch {
            result.set(originalKey, null);
          }
        } else {
          result.set(originalKey, null);
        }
      });
    } catch (error) {
      console.error('Error getting multiple items:', error);
    }

    return result;
  }

  /**
   * Cache user data for offline access
   */
  static async cacheUserData(userId: string, userData: any): Promise<void> {
    await this.set(`user:${userId}`, userData, this.CACHE_DURATION);
  }

  /**
   * Get cached user data
   */
  static async getCachedUserData(userId: string): Promise<any | null> {
    return this.get(`user:${userId}`);
  }

  /**
   * Cache feed posts for offline viewing
   */
  static async cacheFeedPosts(posts: any[]): Promise<void> {
    await this.set('feed:posts', posts, this.CACHE_DURATION);
  }

  /**
   * Get cached feed posts
   */
  static async getCachedFeedPosts(): Promise<any[] | null> {
    return this.get('feed:posts');
  }

  /**
   * Cache conversation messages
   */
  static async cacheMessages(conversationId: string, messages: any[]): Promise<void> {
    await this.set(`messages:${conversationId}`, messages, this.CACHE_DURATION);
  }

  /**
   * Get cached messages for a conversation
   */
  static async getCachedMessages(conversationId: string): Promise<any[] | null> {
    return this.get(`messages:${conversationId}`);
  }

  /**
   * Store pending actions for later synchronization
   */
  static async addPendingAction(action: any): Promise<void> {
    try {
      const pending = await this.get<any[]>('pending:actions') || [];
      pending.push({
        ...action,
        timestamp: Date.now(),
      });
      await this.set('pending:actions', pending);
    } catch (error) {
      console.error('Error adding pending action:', error);
    }
  }

  /**
   * Get all pending actions
   */
  static async getPendingActions(): Promise<any[]> {
    return (await this.get<any[]>('pending:actions')) || [];
  }

  /**
   * Clear pending actions after successful sync
   */
  static async clearPendingActions(): Promise<void> {
    await this.remove('pending:actions');
  }

  /**
   * Check storage usage
   */
  static async getStorageInfo(): Promise<{
    keys: string[];
    totalItems: number;
  }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const quemiKeys = keys.filter(key => key.startsWith(this.PREFIX));
      
      return {
        keys: quemiKeys.map(key => key.replace(this.PREFIX, '')),
        totalItems: quemiKeys.length,
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return { keys: [], totalItems: 0 };
    }
  }
}

/**
 * Hook for offline-first data fetching
 */
export const useOfflineFirst = <T,>(
  key: string,
  fetchFn: () => Promise<T>,
  options?: {
    cacheTime?: number;
    onError?: (error: Error) => void;
  }
) => {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        // Try to load from cache first
        const cached = await OfflineStorageService.get<T>(key);
        if (cached) {
          setData(cached);
          setLoading(false);
        }

        // Fetch fresh data in background
        const fresh = await fetchFn();
        setData(fresh);
        
        // Cache the fresh data
        await OfflineStorageService.set(key, fresh, options?.cacheTime);
      } catch (err) {
        const error = err as Error;
        setError(error);
        options?.onError?.(error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [key]);

  return { data, loading, error };
};

// Import React for the hook
import React from 'react';
