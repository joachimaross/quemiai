# Enhanced Search Features Guide

## Overview
QUEMI includes powerful search capabilities to help you find posts, users, and hashtags quickly and efficiently.

## Features

### 1. Fuzzy Search
The search uses fuzzy matching to find relevant results even if your query isn't exact.
- Tolerates typos and misspellings
- Finds partial matches
- Weights results by relevance

### 2. Advanced Filters
Filter your search results by:
- **Type**: All, Posts, Users, or Hashtags
- **Sort By**: Relevant, Recent, or Popular
- **Date Range**: All time, Today, This week, or This month

### 3. Search History
- Your recent searches are automatically saved
- Click on a previous search to quickly repeat it
- Clear history at any time

### 4. Keyboard Shortcuts
- `Ctrl+K` or `/` - Focus search bar
- `Escape` - Close search/unfocus

### 5. Real-time Results
- Search results update as you type
- Debounced input prevents excessive searching

## Using Search

### Basic Search
1. Navigate to the Discover page
2. Type your query in the search bar
3. Results appear automatically as you type

### Advanced Search
1. Click the filter icon (funnel) next to the search bar
2. Select your desired filters
3. Results update based on your filter choices

### Search Tips
- Use specific keywords for better results
- Try different variations if you don't find what you're looking for
- Use the filters to narrow down results
- Check different tabs (Trending, People, Hashtags) for comprehensive results

## API Endpoints

### GET /api/search
Basic search endpoint
```
Query Parameters:
- query: string (required)
- type: 'all' | 'posts' | 'users' | 'hashtags' (optional)
- sortBy: 'relevant' | 'recent' | 'popular' (optional)
- dateRange: 'all' | 'today' | 'week' | 'month' (optional)
```

### POST /api/search/advanced
Advanced search with more options
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

### GET /api/search/suggestions
Get autocomplete suggestions
```
Query Parameters:
- query: string (required)
```

### GET /api/search/trending
Get trending searches and topics

## For Developers

### Using Search Components
```tsx
import { EnhancedSearch } from '@/components/search';

function MyComponent() {
  const handleSearch = (query, filters) => {
    // Perform search logic
    return {
      users: [],
      posts: [],
      hashtags: []
    };
  };

  return (
    <EnhancedSearch onSearch={handleSearch}>
      {(result, isLoading) => (
        <div>
          {/* Render results */}
        </div>
      )}
    </EnhancedSearch>
  );
}
```

### Using Search Hooks
```tsx
import { useDebouncedSearch, useSearchHistory, useKeyboardShortcuts } from '@/hooks';

// Debounce search input
const debouncedQuery = useDebouncedSearch(query, 300);

// Manage search history
const { searchHistory, addToHistory, clearHistory } = useSearchHistory();

// Register keyboard shortcuts
useKeyboardShortcuts([
  { key: 'k', ctrlKey: true, callback: () => console.log('Ctrl+K pressed') }
]);
```

### Using Search Utilities
```tsx
import { 
  fuzzySearchUsers, 
  fuzzySearchPosts,
  contentSearchPosts,
  regexSearchUsers 
} from '@/lib/search';

// Fuzzy search
const users = fuzzySearchUsers(allUsers, 'john', { threshold: 0.3 });

// Content-aware search with relevance scoring
const posts = contentSearchPosts(allPosts, 'react hooks', {
  includeMedia: true,
  includeTags: true
});

// Regex search
const results = regexSearchUsers(allUsers, '^john.*smith$');
```
