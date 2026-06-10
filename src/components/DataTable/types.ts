import type * as React from 'react'
import type { ColumnDef, Row } from '@tanstack/react-table'

/**
 * Paginación controlada (server-side / manual).
 * `pageIndex` es 0-based.
 */
export interface DataTablePaginationConfig {
  pageIndex: number
  pageSize: number
  /** Total de filas en el servidor (no solo las de la página actual). */
  total: number
  onPageChange: (pageIndex: number) => void
  onPageSizeChange?: (pageSize: number) => void
  pageSizeOptions?: number[]
}

/**
 * - `true`: paginación client-side automática (TanStack maneja el estado).
 * - `DataTablePaginationConfig`: paginación manual/server-side controlada por el consumidor.
 * - `undefined`: sin paginación.
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
