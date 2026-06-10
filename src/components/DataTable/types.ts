import type * as React from 'react'
import type { ColumnDef, Row } from '@tanstack/react-table'

/**
 * Controlled pagination (server-side / manual).
 * `pageIndex` is 0-based.
 */
export interface DataTablePaginationConfig {
  pageIndex: number
  pageSize: number
  /** Total row count on the server (not just the current page). */
  total: number
  onPageChange: (pageIndex: number) => void
  onPageSizeChange?: (pageSize: number) => void
  pageSizeOptions?: number[]
}

/**
 * - `true`: automatic client-side pagination (TanStack manages state).
 * - `DataTablePaginationConfig`: manual/server-side pagination controlled by the consumer.
 * - `undefined`: no pagination.
 */
export type DataTablePaginationProp = boolean | DataTablePaginationConfig

export interface DataTableProps<TData, TValue = unknown> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  loading?: boolean
  emptyMessage?: React.ReactNode
  pagination?: DataTablePaginationProp
  onRowClick?: (row: TData, tableRow: Row<TData>) => void
  className?: string
}
