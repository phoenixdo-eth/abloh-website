'use client';

import React, { useState, useMemo } from 'react';
import { Filter, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import DataTable, { ColumnDef } from './data-table';

// Re-export ColumnDef for convenience
export type { ColumnDef };

// ============================================================================
// Types
// ============================================================================

export interface FilterOption {
  key: string;
  label: string;
  values: Array<{ label: string; value: string }>;
}

export interface DataTableWrapperProps<T = Record<string, unknown>> {
  // Table data and configuration
  data: T[];
  columns: ColumnDef<T>[];
  title: string;

  // Search configuration
  searchable?: boolean;
  searchKeys?: string[]; // Keys to search in (if not provided, searches all string fields)
  searchPlaceholder?: string;

  // Filter configuration
  filterable?: boolean;
  filterOptions?: FilterOption[];
  onFilterChange?: (filters: Record<string, string[]>) => void;

  // Add functionality
  addable?: boolean;
  onAdd?: () => void;
  addButtonLabel?: string;

  // DataTable props
  selectable?: boolean;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  hoverable?: boolean;

  // Pagination
  paginated?: boolean;
  defaultPageSize?: number;
  pageSizeOptions?: number[];

  // Theming
  theme?: 'default' | 'blue';
}

// ============================================================================
// DataTableWrapper Component
// ============================================================================

export default function DataTableWrapper<T extends Record<string, unknown>>({
  data,
  columns,
  title,
  searchable = true,
  searchKeys,
  searchPlaceholder = 'Search',
  filterable = true,
  filterOptions = [],
  onFilterChange,
  addable = true,
  onAdd,
  addButtonLabel = 'Add',
  selectable = false,
  onRowClick,
  emptyMessage = 'No data available',
  hoverable = true,
  paginated = true,
  defaultPageSize = 25,
  pageSizeOptions = [10, 25, 50, 100],
  theme = 'default',
}: DataTableWrapperProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  // Search functionality
  const searchInRow = (row: T, term: string): boolean => {
    const lowerTerm = term.toLowerCase();

    // If specific search keys are provided, only search those
    if (searchKeys && searchKeys.length > 0) {
      return searchKeys.some(key => {
        const value = key.includes('.')
          ? key.split('.').reduce((obj: Record<string, unknown>, k) => (obj?.[k] as Record<string, unknown>) || {}, row as Record<string, unknown>)
          : row[key];

        return String(value || '').toLowerCase().includes(lowerTerm);
      });
    }

    // Otherwise, search all string/number values in the row
    return Object.values(row).some(value => {
      if (typeof value === 'string' || typeof value === 'number') {
        return String(value).toLowerCase().includes(lowerTerm);
      }
      // Handle nested objects (like totalCashEquity.amount)
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some(nestedValue =>
          String(nestedValue || '').toLowerCase().includes(lowerTerm)
        );
      }
      return false;
    });
  };

  // Filter functionality
  const filterRow = (row: T): boolean => {
    if (Object.keys(activeFilters).length === 0) return true;

    return Object.entries(activeFilters).every(([key, values]) => {
      if (values.length === 0) return true;

      const rowValue = key.includes('.')
        ? key.split('.').reduce((obj: Record<string, unknown>, k) => (obj?.[k] as Record<string, unknown>) || {}, row as Record<string, unknown>)
        : row[key];

      return values.includes(String(rowValue));
    });
  };

  // Combined filtering
  const filteredData = useMemo(() => {
    let result = data;

    // Apply search filter
    if (searchable && searchTerm) {
      result = result.filter(row => searchInRow(row, searchTerm));
    }

    // Apply column filters
    if (filterable && Object.keys(activeFilters).length > 0) {
      result = result.filter(filterRow);
    }

    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, searchTerm, activeFilters]);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeFilters]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = useMemo(() => {
    if (!paginated) return filteredData;

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, pageSize, paginated]);

  const handleFilterToggle = (filterKey: string, value: string) => {
    setActiveFilters(prev => {
      const currentValues = prev[filterKey] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];

      const newFilters = {
        ...prev,
        [filterKey]: newValues,
      };

      // Remove empty filter arrays
      if (newValues.length === 0) {
        delete newFilters[filterKey];
      }

      onFilterChange?.(newFilters);
      return newFilters;
    });
  };

  const clearFilters = () => {
    setActiveFilters({});
    onFilterChange?.({});
  };

  const activeFilterCount = Object.values(activeFilters).reduce(
    (sum, values) => sum + values.length,
    0
  );

  const headerClass = theme === 'blue'
    ? 'flex items-center justify-between p-4 border-b border-blue-200 dark:border-blue-800'
    : 'flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700';

  return (
    <div className={theme === 'blue'
      ? 'bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-800'
      : 'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700'
    }>
      {/* Table Header */}
      <div className={headerClass}>
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            · Showing {paginated && filteredData.length > 0
              ? `${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, filteredData.length)} of ${filteredData.length}`
              : filteredData.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          {searchable && (
            <div className="relative">
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg
                className="w-4 h-4 absolute left-2.5 top-2.5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          )}

          {/* Filter */}
          {filterable && filterOptions.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowFilterModal(!showFilterModal)}
                className="relative p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Filter Modal */}
              {showFilterModal && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowFilterModal(false)}
                  />
                  <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-y-auto">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
                      {activeFilterCount > 0 && (
                        <button
                          onClick={clearFilters}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Clear all
                        </button>
                      )}
                    </div>

                    {filterOptions.map((filter) => (
                      <div key={filter.key} className="p-4 border-b border-gray-200 dark:border-gray-700 last:border-0">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                          {filter.label}
                        </h4>
                        <div className="space-y-2">
                          {filter.values.map((option) => (
                            <label
                              key={option.value}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={activeFilters[filter.key]?.includes(option.value) || false}
                                onChange={() => handleFilterToggle(filter.key, option.value)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {option.label}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Add Button */}
          {addable && (
            <button
              onClick={onAdd}
              className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              title={addButtonLabel}
            >
              <Plus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        data={paginatedData}
        columns={columns}
        selectable={selectable}
        onRowClick={onRowClick}
        emptyMessage={emptyMessage}
        hoverable={hoverable}
      />

      {/* Pagination */}
      {paginated && filteredData.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700 dark:text-gray-300">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 text-sm border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {pageSizeOptions.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Page {currentPage} of {totalPages}
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                aria-label="Next page"
              >
                <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
