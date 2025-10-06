import { SearchFilters } from '@/lib/types';

const SAVED_SEARCHES_KEY = 'quemi_saved_searches';

export interface SavedSearch {
  id: string;
  name: string;
  filters: SearchFilters;
  createdAt: Date;
}

/**
 * Get all saved searches from localStorage
 */
export function getSavedSearches(): SavedSearch[] {
  const stored = localStorage.getItem(SAVED_SEARCHES_KEY);
  if (!stored) return [];

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed)
      ? parsed.map((item) => ({
          ...item,
          createdAt: new Date(item.createdAt),
        }))
      : [];
  } catch (error) {
    console.error('Error loading saved searches:', error);
    return [];
  }
}

/**
 * Save a new search
 */
export function saveSearch(name: string, filters: SearchFilters): SavedSearch {
  const searches = getSavedSearches();
  const newSearch: SavedSearch = {
    id: Date.now().toString(),
    name,
    filters,
    createdAt: new Date(),
  };

  searches.push(newSearch);
  localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(searches));

  return newSearch;
}

/**
 * Delete a saved search
 */
export function deleteSavedSearch(id: string): void {
  const searches = getSavedSearches();
  const filtered = searches.filter((search) => search.id !== id);
  localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(filtered));
}

/**
 * Update a saved search
 */
export function updateSavedSearch(
  id: string,
  updates: Partial<Omit<SavedSearch, 'id' | 'createdAt'>>
): SavedSearch | null {
  const searches = getSavedSearches();
  const index = searches.findIndex((search) => search.id === id);

  if (index === -1) return null;

  const updated = {
    ...searches[index],
    ...updates,
  };

  searches[index] = updated;
  localStorage.setItem(SAVED_SEARCHES_KEY, JSON.stringify(searches));

  return updated;
}

/**
 * Clear all saved searches
 */
export function clearSavedSearches(): void {
  localStorage.removeItem(SAVED_SEARCHES_KEY);
}
