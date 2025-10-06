import { useState, useEffect } from 'react';

const SEARCH_HISTORY_KEY = 'quemi_search_history';
const MAX_HISTORY_ITEMS = 10;

/**
 * Custom hook for managing search history
 * @returns Object with search history and methods to manage it
 */
export function useSearchHistory() {
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Load search history from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSearchHistory(Array.isArray(parsed) ? parsed : []);
      } catch (error) {
        console.error('Error loading search history:', error);
        setSearchHistory([]);
      }
    }
  }, []);

  // Save to localStorage whenever history changes
  useEffect(() => {
    if (searchHistory.length > 0) {
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(searchHistory));
    }
  }, [searchHistory]);

  const addToHistory = (query: string) => {
    if (!query.trim()) return;
    
    setSearchHistory((prev) => {
      // Remove duplicates and add new query at the beginning
      const filtered = prev.filter((item) => item !== query);
      const updated = [query, ...filtered].slice(0, MAX_HISTORY_ITEMS);
      return updated;
    });
  };

  const removeFromHistory = (query: string) => {
    setSearchHistory((prev) => prev.filter((item) => item !== query));
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  };

  return {
    searchHistory,
    addToHistory,
    removeFromHistory,
    clearHistory,
  };
}
