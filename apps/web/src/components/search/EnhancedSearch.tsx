'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Filter, Clock } from 'lucide-react';
import { SearchFilters as SearchFiltersType, SearchResult } from '@/lib/types';
import { SearchFilters } from './SearchFilters';
import { useDebouncedSearch } from '@/hooks/useDebouncedSearch';
import { useSearchHistory } from '@/hooks/useSearchHistory';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

interface EnhancedSearchProps {
  onSearch: (query: string, filters: SearchFiltersType) => SearchResult;
  placeholder?: string;
  children: (result: SearchResult, isLoading: boolean) => React.ReactNode;
}

export function EnhancedSearch({
  onSearch,
  placeholder = 'Search posts, people, hashtags...',
  children,
}: EnhancedSearchProps) {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFiltersType>({
    query: '',
    type: 'all',
    sortBy: 'relevant',
    dateRange: 'all',
  });
  const [searchResult, setSearchResult] = useState<SearchResult>({
    users: [],
    posts: [],
    hashtags: [],
  });

  const searchInputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebouncedSearch(query, 300);
  const { searchHistory, addToHistory, removeFromHistory, clearHistory } =
    useSearchHistory();

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'k',
      ctrlKey: true,
      callback: () => {
        searchInputRef.current?.focus();
      },
    },
    {
      key: '/',
      callback: () => {
        searchInputRef.current?.focus();
      },
    },
    {
      key: 'Escape',
      callback: () => {
        setShowHistory(false);
        searchInputRef.current?.blur();
      },
    },
  ]);

  // Perform search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim()) {
      setIsLoading(true);
      const updatedFilters = { ...filters, query: debouncedQuery };
      const result = onSearch(debouncedQuery, updatedFilters);
      setSearchResult(result);
      setIsLoading(false);
      addToHistory(debouncedQuery);
      setShowHistory(false);
    } else {
      setSearchResult({ users: [], posts: [], hashtags: [] });
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, filters]);

  const handleQueryChange = (newQuery: string) => {
    setQuery(newQuery);
    if (newQuery.trim()) {
      setShowHistory(false);
    }
  };

  const handleHistoryClick = (historyQuery: string) => {
    setQuery(historyQuery);
    setShowHistory(false);
    searchInputRef.current?.focus();
  };

  const handleClearSearch = () => {
    setQuery('');
    setSearchResult({ users: [], posts: [], hashtags: [] });
    searchInputRef.current?.focus();
  };

  return (
    <div className="w-full">
      {/* Search Input */}
      <div className="relative mb-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onFocus={() => !query.trim() && setShowHistory(true)}
            placeholder={placeholder}
            className="w-full pl-12 pr-24 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-zeeky-blue"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
            {query && (
              <button
                onClick={handleClearSearch}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors ${
                showFilters
                  ? 'bg-zeeky-blue text-white'
                  : 'hover:bg-gray-700 text-gray-400'
              }`}
              aria-label="Toggle filters"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search History Dropdown */}
        {showHistory && searchHistory.length > 0 && (
          <div className="absolute top-full mt-2 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
            <div className="flex items-center justify-between p-3 border-b border-gray-700">
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Clock className="w-4 h-4" />
                <span>Recent Searches</span>
              </div>
              <button
                onClick={clearHistory}
                className="text-xs text-gray-400 hover:text-white transition-colors"
              >
                Clear all
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {searchHistory.map((historyItem, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 hover:bg-gray-700 transition-colors group"
                >
                  <button
                    onClick={() => handleHistoryClick(historyItem)}
                    className="flex-1 text-left text-white"
                  >
                    {historyItem}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromHistory(historyItem);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-600 rounded transition-all"
                    aria-label="Remove from history"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <SearchFilters
        filters={filters}
        onFiltersChange={setFilters}
        showFilters={showFilters}
      />

      {/* Search Results */}
      <div className="mt-4">{children(searchResult, isLoading)}</div>

      {/* Keyboard Shortcuts Hint */}
      <div className="mt-4 text-center text-xs text-gray-500">
        Press <kbd className="px-2 py-1 bg-gray-700 rounded">Ctrl+K</kbd> or{' '}
        <kbd className="px-2 py-1 bg-gray-700 rounded">/</kbd> to search
      </div>
    </div>
  );
}
