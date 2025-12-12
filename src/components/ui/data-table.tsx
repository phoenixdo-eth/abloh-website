'use client';

import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Edit, MoreVertical, ChevronRight } from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

export type CellType =
  | 'text'
  | 'number'
  | 'currency'
  | 'percentage'
  | 'badge'
  | 'status'
  | 'link'
  | 'progress'
  | 'actions'
  | 'avatar'
  | 'custom';

export type BadgeVariant = 'default' | 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'cyan';

export interface StatusConfig {
  color: string; // Tailwind color class (e.g., 'blue', 'green')
  label: string;
}

export interface ColumnDef<T = Record<string, unknown>> {
  key: string;
  header: string;
  type?: CellType;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';

  // For badge type
  badgeVariant?: BadgeVariant | ((value: Record<string, unknown>, row: T) => BadgeVariant);
  splitBadges?: boolean; // If true, splits string values by space into multiple badges

  // For status type
  statusConfig?: Record<string, StatusConfig>;

  // For currency type
  currencyFormat?: 'full' | 'abbreviated'; // '$120,000' vs '$120K'

  // For link type
  onLinkClick?: (row: T) => void;

  // For actions type
  actions?: Array<{
    icon?: React.ComponentType<{ className?: string }>;
    label?: string;
    onClick: (row: T) => void;
    variant?: 'default' | 'edit' | 'more' | 'chevron';
  }>;

  // For progress type
  progressMax?: number;
  progressColor?: string;

  // For avatar type
  avatarFallback?: (row: T) => string;

  // Custom render function
  render?: (value: Record<string, unknown>, row: T) => React.ReactNode;

  // Value accessor for nested properties
  accessor?: (row: T) => unknown;
}

export interface DataTableProps<T = Record<string, unknown>> {
  data: T[];
  columns: ColumnDef<T>[];
  selectable?: boolean;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  className?: string;
  hoverable?: boolean;
}

// ============================================================================
// Cell Renderers
// ============================================================================

const formatCurrency = (value: number, format: 'full' | 'abbreviated' = 'abbreviated'): string => {
  if (format === 'abbreviated') {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`.replace(/\.00M$/, 'M');
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(2)}K`.replace(/\.00K$/, 'K');
    }
    return `$${value.toFixed(2)}`;
  }
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const getBadgeClasses = (variant: BadgeVariant): string => {
  const variants: Record<BadgeVariant, string> = {
    default: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    cyan: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  };
  return variants[variant];
};

// ============================================================================
// DataTable Component
// ============================================================================

export default function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  selectable = false,
  onRowClick,
  emptyMessage = 'No data available',
  className = '',
  hoverable = true,
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  // Sorting logic
  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    const sorted = [...data].sort((a, b) => {
      const column = columns.find(col => col.key === sortConfig.key);
      const aValue = column?.accessor ? column.accessor(a) : a[sortConfig.key];
      const bValue = column?.accessor ? column.accessor(b) : b[sortConfig.key];

      if (aValue === bValue) return 0;

      // Handle comparison with unknown types by converting to primitives
      const aComp = aValue as string | number | boolean;
      const bComp = bValue as string | number | boolean;
      const comparison = aComp < bComp ? -1 : 1;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [data, sortConfig, columns]);

  const handleSort = (key: string) => {
    setSortConfig(current => {
      if (current?.key === key) {
        return current.direction === 'asc'
          ? { key, direction: 'desc' }
          : null;
      }
      return { key, direction: 'asc' };
    });
  };

  const handleSelectAll = () => {
    if (selectedRows.size === data.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(data.map((_, index) => index)));
    }
  };

  const handleSelectRow = (index: number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRows(newSelected);
  };

  const renderCell = (column: ColumnDef<T>, row: T, rowIndex: number): React.ReactNode => {
    const value = column.accessor ? column.accessor(row) : row[column.key];

    // Custom render takes precedence
    if (column.render) {
      return column.render(value as Record<string, unknown>, row);
    }

    // Type-based rendering
    switch (column.type) {
      case 'number':
        return <span className="text-gray-900 dark:text-white">{Math.round(value as number)?.toLocaleString()}</span>;

      case 'currency':
        return (
          <span className="text-gray-900 dark:text-white font-medium">
            {formatCurrency(value as number, column.currencyFormat)}
          </span>
        );

      case 'percentage':
        return <span className="text-gray-900 dark:text-white">{value as number}%</span>;

      case 'badge':
        // Handle arrays or split strings into multiple badges
        const badges = Array.isArray(value)
          ? value
          : column.splitBadges && typeof value === 'string'
          ? value.split(' ')
          : [value];

        return (
          <div className="flex flex-wrap gap-1">
            {badges.map((badge, index) => {
              const variant = typeof column.badgeVariant === 'function'
                ? column.badgeVariant(badge, row)
                : column.badgeVariant || 'default';
              return (
                <span
                  key={index}
                  className={`px-2 py-1 rounded text-xs font-medium ${getBadgeClasses(variant)}`}
                >
                  {badge}
                </span>
              );
            })}
          </div>
        );

      case 'status':
        const statusConfig = column.statusConfig?.[value as string];
        if (!statusConfig) return String(value);
        return (
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full bg-${statusConfig.color}-500`}></div>
            <span className={`text-sm text-${statusConfig.color}-600 dark:text-${statusConfig.color}-400`}>
              {statusConfig.label}
            </span>
          </div>
        );

      case 'link':
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              column.onLinkClick?.(row);
            }}
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium text-sm"
          >
            {value as string}
          </button>
        );

      case 'progress':
        const max = column.progressMax || 100;
        const percentage = ((value as number) / max) * 100;
        return (
          <div className="flex items-center gap-2">
            <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`${column.progressColor || 'bg-blue-500'} h-2 rounded-full`}
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{value as number}%</span>
          </div>
        );

      case 'actions':
        return (
          <div className="flex items-center gap-2">
            {column.actions?.map((action, actionIndex) => {
              const Icon = action.icon;

              if (action.variant === 'edit') {
                return (
                  <button
                    key={actionIndex}
                    onClick={(e) => {
                      e.stopPropagation();
                      action.onClick(row);
                    }}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition"
                    aria-label="Edit"
                  >
                    <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                );
              }

              if (action.variant === 'more') {
                return (
                  <button
                    key={actionIndex}
                    onClick={(e) => {
                      e.stopPropagation();
                      action.onClick(row);
                    }}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition"
                    aria-label="More"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                );
              }

              if (action.variant === 'chevron') {
                return (
                  <ChevronRight key={actionIndex} className="w-4 h-4 text-gray-400" />
                );
              }

              return Icon ? (
                <button
                  key={actionIndex}
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onClick(row);
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                  aria-label={action.label}
                >
                  <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              ) : null;
            })}
          </div>
        );

      case 'avatar':
        const fallback = column.avatarFallback?.(row) || (value as string)?.charAt(0) || '?';
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <span className="text-white text-sm font-semibold">{fallback}</span>
            </div>
            <span className="font-medium text-gray-900 dark:text-white">{value as string}</span>
          </div>
        );

      case 'text':
      default:
        return <span className="text-gray-900 dark:text-white">{String(value)}</span>;
    }
  };

  const getAlignment = (align?: 'left' | 'center' | 'right') => {
    switch (align) {
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      default: return 'text-left';
    }
  };

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full" style={{ tableLayout: 'auto' }}>
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            {selectable && (
              <th className="text-left py-3 px-4">
                <input
                  type="checkbox"
                  checked={selectedRows.size === data.length && data.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300"
                />
              </th>
            )}
            {columns.map((column) => (
              <th
                key={column.key}
                className={`py-3 px-4 text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap ${getAlignment(column.align)}`}
                style={{ width: column.width }}
              >
                {column.sortable !== false ? (
                  <button
                    onClick={() => handleSort(column.key)}
                    className="flex items-center gap-1 hover:text-gray-900 dark:hover:text-white transition"
                  >
                    {column.header}
                    {sortConfig?.key === column.key && (
                      sortConfig?.direction === 'asc'
                        ? <ChevronUp className="w-3 h-3" />
                        : <ChevronDown className="w-3 h-3" />
                    )}
                  </button>
                ) : (
                  column.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (selectable ? 1 : 0)}
                className="py-8 text-center text-gray-500 dark:text-gray-400"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sortedData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                onClick={() => onRowClick?.(row)}
                className={`border-b border-gray-100 dark:border-gray-700 last:border-0 ${
                  hoverable ? 'hover:bg-gray-50 dark:hover:bg-gray-800/50' : ''
                } ${onRowClick ? 'cursor-pointer' : ''} transition`}
              >
                {selectable && (
                  <td className="py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(rowIndex)}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleSelectRow(rowIndex);
                      }}
                      className="rounded border-gray-300"
                    />
                  </td>
                )}
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`py-3 px-4 whitespace-nowrap ${getAlignment(column.align)}`}
                  >
                    {renderCell(column, row, rowIndex)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
