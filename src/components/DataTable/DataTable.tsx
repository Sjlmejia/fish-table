'use client'

import * as React from 'react'
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
  type Table as TanstackTable,
} from '@tanstack/react-table'
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronsUpDown,
  Loader2,
} from 'lucide-react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'
import { cn } from '../../lib/utils'
import type { DataTablePaginationConfig, DataTableProps } from './types'

const DEFAULT_PAGE_SIZE = 10

export function DataTable<TData, TValue = unknown>({
  columns,
  data,
  loading = false,
  emptyMessage = 'No hay resultados.',
  pagination,
  onRowClick,
  className,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [internalPagination, setInternalPagination] = React.useState({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  })

  const isManualPagination = typeof pagination === 'object' && pagination !== null
  const isClientPagination = pagination === true

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      ...(isManualPagination
        ? {
            pagination: {
              pageIndex: pagination.pageIndex,
              pageSize: pagination.pageSize,
            },
          }
        : isClientPagination
          ? { pagination: internalPagination }
          : {}),
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    ...(isClientPagination
      ? {
          getPaginationRowModel: getPaginationRowModel(),
          onPaginationChange: setInternalPagination,
        }
      : {}),
    ...(isManualPagination
      ? {
          manualPagination: true,
          pageCount: Math.max(1, Math.ceil(pagination.total / pagination.pageSize)),
        }
      : {}),
    // Columns must opt in to sorting with `enableSorting: true`
    defaultColumn: { enableSorting: false },
  })

  const rows = table.getRowModel().rows

  return (
    <div className={cn('w-full', className)}>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        className="hover:text-foreground inline-flex cursor-pointer items-center gap-1 select-none"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() === 'asc' ? (
                          <ChevronUp className="size-3.5" />
                        ) : header.column.getIsSorted() === 'desc' ? (
                          <ChevronDown className="size-3.5" />
                        ) : (
                          <ChevronsUpDown className="size-3.5 opacity-50" />
                        )}
                      </button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <span className="text-muted-foreground inline-flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    Cargando...
                  </span>
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-muted-foreground h-24 text-center"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              rows.map(row => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  onClick={onRowClick ? () => onRowClick(row.original, row) : undefined}
                  className={cn(onRowClick && 'cursor-pointer')}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && (
        <DataTablePagination
          table={table}
          config={isManualPagination ? pagination : undefined}
        />
      )}
    </div>
  )
}

function DataTablePagination<TData>({
  table,
  config,
}: {
  table: TanstackTable<TData>
  config?: DataTablePaginationConfig
}) {
  const { pageIndex, pageSize } = table.getState().pagination
  const pageCount = table.getPageCount()
  const total = config?.total ?? table.getFilteredRowModel().rows.length

  const goToPage = (index: number) => {
    const clamped = Math.min(Math.max(0, index), pageCount - 1)
    if (config) {
      config.onPageChange(clamped)
    } else {
      table.setPageIndex(clamped)
    }
  }

  const startItem = total === 0 ? 0 : pageIndex * pageSize + 1
  const endItem = Math.min((pageIndex + 1) * pageSize, total)

  const visiblePages = getVisiblePages(pageIndex, pageCount)

  return (
    <div className="text-muted-foreground flex items-center justify-between py-3 text-sm">
      <div>
        Mostrando{' '}
        <span className="text-foreground font-medium">
          {startItem} - {endItem}
        </span>{' '}
        de <span className="text-foreground font-medium">{total}</span>
      </div>

      <div className="flex items-center gap-1">
        <PagerButton
          onClick={() => goToPage(pageIndex - 1)}
          disabled={pageIndex === 0}
          ariaLabel="Página anterior"
        >
          <ChevronLeft className="size-4" />
        </PagerButton>

        {visiblePages.map(p => (
          <PagerButton
            key={p}
            onClick={() => goToPage(p)}
            active={p === pageIndex}
            ariaLabel={`Página ${p + 1}`}
          >
            {p + 1}
          </PagerButton>
        ))}

        <PagerButton
          onClick={() => goToPage(pageIndex + 1)}
          disabled={pageIndex >= pageCount - 1}
          ariaLabel="Página siguiente"
        >
          <ChevronRight className="size-4" />
        </PagerButton>
      </div>
    </div>
  )
}

function PagerButton({
  children,
  onClick,
  disabled,
  active,
  ariaLabel,
}: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  active?: boolean
  ariaLabel: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'inline-flex h-8 min-w-8 items-center justify-center rounded-md border px-2 text-sm transition-colors',
        active
          ? 'bg-primary text-primary-foreground border-primary'
          : 'bg-background hover:bg-muted',
        disabled && 'cursor-not-allowed opacity-50'
      )}
    >
      {children}
    </button>
  )
}

function getVisiblePages(pageIndex: number, pageCount: number, maxVisible = 5): number[] {
  if (pageCount <= maxVisible) {
    return Array.from({ length: pageCount }, (_, i) => i)
  }

  let start = Math.max(0, pageIndex - Math.floor(maxVisible / 2))
  const end = Math.min(pageCount - 1, start + maxVisible - 1)

  if (end - start < maxVisible - 1) {
    start = Math.max(0, end - maxVisible + 1)
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}
