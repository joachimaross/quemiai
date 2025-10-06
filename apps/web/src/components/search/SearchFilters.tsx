'use client';

import { SearchFilters as SearchFiltersType } from '@/lib/types';
import { Filter, Calendar, TrendingUp } from 'lucide-react';

interface SearchFiltersProps {
  filters: SearchFiltersType;
  onFiltersChange: (filters: SearchFiltersType) => void;
  showFilters: boolean;
}

export function SearchFilters({
  filters,
  onFiltersChange,
  showFilters,
}: SearchFiltersProps) {
  if (!showFilters) return null;

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-4 space-y-4">
      <div className="flex items-center space-x-2 text-white font-semibold mb-3">
        <Filter className="w-5 h-5" />
        <span>Filters</span>
      </div>

      {/* Type Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Search In
        </label>
        <div className="flex flex-wrap gap-2">
          {(['all', 'posts', 'users', 'hashtags'] as const).map((type) => (
            <button
              key={type}
              onClick={() => onFiltersChange({ ...filters, type })}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filters.type === type
                  ? 'bg-zeeky-blue text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Sort By Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <TrendingUp className="w-4 h-4 inline mr-1" />
          Sort By
        </label>
        <div className="flex flex-wrap gap-2">
          {(['relevant', 'recent', 'popular'] as const).map((sortBy) => (
            <button
              key={sortBy}
              onClick={() => onFiltersChange({ ...filters, sortBy })}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filters.sortBy === sortBy
                  ? 'bg-zeeky-blue text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Date Range Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <Calendar className="w-4 h-4 inline mr-1" />
          Date Range
        </label>
        <div className="flex flex-wrap gap-2">
          {(['all', 'today', 'week', 'month'] as const).map((dateRange) => (
            <button
              key={dateRange}
              onClick={() => onFiltersChange({ ...filters, dateRange })}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filters.dateRange === dateRange
                  ? 'bg-zeeky-blue text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {dateRange.charAt(0).toUpperCase() + dateRange.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
